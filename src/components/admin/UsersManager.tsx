"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { updateUserRole } from "@/app/admin/actions"

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string | null
}

function PaginatedTable({ data, isUpdating, handleRoleChange }: { data: Profile[], isUpdating: string | null, handleRoleChange: (id: string, role: string) => void }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4 mt-4">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="w-[200px]">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((profile) => (
                <TableRow key={profile.id} className="group transition-colors hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{profile.email}</TableCell>
                  <TableCell className="text-slate-600">{profile.full_name || "-"}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={profile.role || "user"}
                      onValueChange={(val) => handleRoleChange(profile.id, val)}
                      disabled={isUpdating === profile.id}
                    >
                      <SelectTrigger className="h-8 w-32 bg-white/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium text-slate-900">{data.length}</span> users
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function UsersManager({ profiles }: { profiles: Profile[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId)
    try {
      await updateUserRole(userId, newRole)
    } catch (err) {
      alert("Failed to update user role")
    } finally {
      setIsUpdating(null)
    }
  }

  const admins = profiles.filter((p) => p.role === "admin")
  const users = profiles.filter((p) => p.role !== "admin")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight text-slate-950 sm:text-4xl">User Management</h2>
        <p className="mt-2 text-sm text-slate-500">Manage permissions and roles for all registered accounts.</p>
      </div>

      <Tabs defaultValue="admins" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 bg-slate-100/50">
          <TabsTrigger value="admins">Administrators ({admins.length})</TabsTrigger>
          <TabsTrigger value="users">Standard Users ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="admins">
          <PaginatedTable data={admins} isUpdating={isUpdating} handleRoleChange={handleRoleChange} />
        </TabsContent>
        <TabsContent value="users">
          <PaginatedTable data={users} isUpdating={isUpdating} handleRoleChange={handleRoleChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
