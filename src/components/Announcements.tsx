
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Clock, AlertTriangle, Info, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  location: 'likoni' | 'mtongwe' | 'both';
  priority: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  expires_at?: string;
  created_at: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    location: 'both' as 'likoni' | 'mtongwe' | 'both',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    expires_in_hours: 24
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data as Announcement[]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + formData.expires_in_hours);

      const { error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title.trim(),
          message: formData.message.trim(),
          location: formData.location,
          priority: formData.priority,
          expires_at: expiresAt.toISOString(),
          active: true
        });

      if (error) throw error;

      toast.success('Announcement created successfully');
      setFormData({
        title: '',
        message: '',
        location: 'both',
        priority: 'medium',
        expires_in_hours: 24
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading announcements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Ferry Operator Announcements
            </CardTitle>
            <p className="text-sm text-gray-600">
              Official updates and notices from ferry operations
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </CardHeader>
        
        {showForm && (
          <CardContent className="border-t">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value: 'likoni' | 'mtongwe' | 'both') => 
                      setFormData({...formData, location: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both Terminals</SelectItem>
                      <SelectItem value="likoni">Likoni Only</SelectItem>
                      <SelectItem value="mtongwe">Mtongwe Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                      setFormData({...formData, priority: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Scheduled Maintenance"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Detailed announcement message..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Expires in (hours)</label>
                <Input
                  type="number"
                  value={formData.expires_in_hours}
                  onChange={(e) => setFormData({...formData, expires_in_hours: parseInt(e.target.value) || 24})}
                  min="1"
                  max="168"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No active announcements at this time
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`border-l-4 ${getPriorityColor(announcement.priority).replace('bg-', 'border-').replace('-100', '-400')}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant="outline">
                        {announcement.location === 'both' ? 'All Terminals' : announcement.location}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted: {new Date(announcement.created_at).toLocaleString()}
                      </span>
                      {announcement.expires_at && (
                        <span>
                          Expires: {new Date(announcement.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
