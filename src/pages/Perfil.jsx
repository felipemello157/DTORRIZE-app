"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { base44 } from "@/api/base44Client"

export default function Perfil() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const ownerQuery = useQuery({
    queryKey: ["companyOwner", user?.id],
    queryFn: async () => {
      if (!user) return null
      const result = await base44.entities.CompanyOwner.filter({ user_id: user.id })
      return result[0] || null
    },
    enabled: !!user,
  })

  const unitQuery = useQuery({
    queryKey: ["companyUnit", ownerQuery.data?.id],
    queryFn: async () => {
      if (!ownerQuery.data) return null
      const result = await base44.entities.CompanyUnit.filter({ owner_id: ownerQuery.data.id })
      return result[0] || null
    },
    enabled: !!ownerQuery.data,
  })

  const companyUnit = unitQuery.data
}
