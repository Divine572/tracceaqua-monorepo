import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserRole, RoleApplication } from '@/types'
import api from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

interface SubmitApplicationData {
  requestedRole: UserRole
  organization?: string
  licenseNumber?: string
  businessType?: string
  experience: string
  motivation: string
}

export function useRoleApplications() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()

  // Get user's applications
  const {
    data: userApplications,
    isLoading: isLoadingApplications,
    error: applicationsError,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: ['role-applications', 'user', user?.id],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch('/api/role-applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      return response.json()
    },
    enabled: !!user && !!token,
  })

  // Submit new application
  const submitApplicationMutation = useMutation({
    mutationFn: async ({ data, files }: { data: SubmitApplicationData; files: File[] }) => {
      if (!token) throw new Error('No authentication token')

      const formData = new FormData()
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })

      // Add files
      files.forEach((file) => {
        formData.append('documents', file)
      })

      const response = await fetch('/api/role-applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to submit application')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['role-applications'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })

  // Update application
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      data, 
      files 
    }: { 
      applicationId: string
      data: Partial<SubmitApplicationData>
      files: File[] 
    }) => {
      if (!token) throw new Error('No authentication token')

      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })

      files.forEach((file) => {
        formData.append('documents', file)
      })

      const response = await fetch(`/api/role-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] })
    },
  })

  // Withdraw application
  const withdrawApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/role-applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to withdraw application')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })

  return {
    // Data
    userApplications: userApplications || [],
    
    // Loading states
    isLoadingApplications,
    isSubmitting: submitApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    isWithdrawing: withdrawApplicationMutation.isPending,
    
    // Errors
    applicationsError,
    submitError: submitApplicationMutation.error,
    updateError: updateApplicationMutation.error,
    withdrawError: withdrawApplicationMutation.error,
    
    // Actions
    submitApplication: async (data: SubmitApplicationData, files: File[] = []) => {
      return submitApplicationMutation.mutateAsync({ data, files })
    },
    updateApplication: async (applicationId: string, data: Partial<SubmitApplicationData>, files: File[] = []) => {
      return updateApplicationMutation.mutateAsync({ applicationId, data, files })
    },
    withdrawApplication: async (applicationId: string) => {
      return withdrawApplicationMutation.mutateAsync(applicationId)
    },
    refetchApplications,
  }
}