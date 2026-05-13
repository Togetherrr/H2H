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
      <Card className="overflow-hidden border-slate-800 bg-slate-900 shadow-xl">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Email</TableHead>
              <TableHead className="text-slate-400 font-medium">Full Name</TableHead>
              <TableHead className="w-[200px] text-slate-400 font-medium">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-slate-800">
            {currentData.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((profile) => (
                <TableRow key={profile.id} className="group transition-colors hover:bg-slate-800/50 border-slate-800">
                  <TableCell className="font-medium text-slate-100">{profile.email}</TableCell>
                  <TableCell className="text-slate-400">{profile.full_name || "-"}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={profile.role || "user"}
                      onValueChange={(val) => handleRoleChange(profile.id, val)}
                      disabled={isUpdating === profile.id}
                    >
                      <SelectTrigger className="h-8 w-32 bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
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
            Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to <span className="font-medium text-slate-200">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium text-slate-200">{data.length}</span> users
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-slate-800 text-slate-400 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-slate-800 text-slate-400 hover:bg-slate-800"
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
      await updateUserRole(userId, newRole as "user" | "admin")
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
        <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">User Management</h2>
        <p className="mt-2 text-sm text-slate-500">Manage permissions and roles for all registered accounts.</p>
      </div>

      <Tabs defaultValue="admins" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="admins" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white">Administrators ({admins.length})</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white">Standard Users ({users.length})</TabsTrigger>
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
