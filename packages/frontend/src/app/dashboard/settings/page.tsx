'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    organization: user?.profile?.organization || '',
    bio: user?.profile?.bio || '',
    phoneNumber: user?.profile?.phoneNumber || '',
    website: user?.profile?.website || '',
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    scanAlerts: true,
    applicationUpdates: true,
    productExpiry: true,
  })

  const handleProfileSave = async () => {
    setIsSaving(true)
    setSavedMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedMessage('Profile updated successfully!')
    } catch (error) {
      setSavedMessage('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleNotificationSave = async () => {
    setIsSaving(true)
    setSavedMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedMessage('Notification preferences updated!')
    } catch (error) {
      setSavedMessage('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {savedMessage && (
        <Alert className={savedMessage.includes('successfully') || savedMessage.includes('updated') 
          ? 'border-green-200 bg-green-50' 
          : 'border-red-200 bg-red-50'
        }>
          {savedMessage.includes('successfully') || savedMessage.includes('updated') ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>{savedMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profileData.organization}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Your company or organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://your-website.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleProfileSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Scan Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Alerts for scan results and product updates
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.scanAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, scanAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Application Updates</Label>
                  <p className="text-sm text-gray-500">
                    Updates on your role application status
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.applicationUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, applicationUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Expiry Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Notifications when scanned products are nearing expiry
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.productExpiry}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, productExpiry: checked }))
                  }
                />
              </div>

              <Button onClick={handleNotificationSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and connected wallets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Connected Wallet</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {user?.address}
                </p>
                <Button variant="outline" size="sm" disabled>
                  Disconnect Wallet
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" size="sm" disabled>
                  Enable 2FA (Coming Soon)
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Session Management</h3>
                <p className="text-sm text-gray-600 mb-2">
                  View and manage your active sessions
                </p>
                <Button variant="outline" size="sm" disabled>
                  Manage Sessions (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how TracceAqua looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Theme</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose your preferred color theme
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Light
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Dark (Coming Soon)
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Auto (Coming Soon)
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Language</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Select your preferred language
                </p>
                <Button variant="outline" size="sm">
                  English (US)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
