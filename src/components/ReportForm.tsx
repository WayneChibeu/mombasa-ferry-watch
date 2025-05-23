
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ReportForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<'likoni' | 'mtongwe' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    return cleanPhone.length >= 9 && /^\d+$/.test(cleanPhone);
  };

  const validateForm = (): boolean => {
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }

    if (!validatePhone(phone)) {
      toast.error('Please enter a valid phone number (minimum 9 digits)');
      return false;
    }

    if (!message.trim()) {
      toast.error('Message is required');
      return false;
    }

    if (!location) {
      toast.error('Please select a location');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Process the SMS through our edge function to analyze it and update status
      const { data, error } = await supabase.functions.invoke('process-sms', {
        body: {
          phone: phone.trim(),
          message: message.trim(),
          location: location as 'likoni' | 'mtongwe'
        }
      });

      if (error) throw error;

      toast.success(`Report submitted successfully! Status analyzed as: ${data.analysis?.status || 'unknown'}`);
      setPhone('');
      setMessage('');
      setLocation('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Report Ferry Status</CardTitle>
        <p className="text-sm text-gray-600">
          Submit real-time status updates from the ferry terminals
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              maxLength={15}
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Select value={location} onValueChange={(value: 'likoni' | 'mtongwe') => setLocation(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ferry location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likoni">Likoni</SelectItem>
                <SelectItem value="mtongwe">Mtongwe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Status Report
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., 'Ferry stuck at dock, engine problem' or 'Long queue, 30 min wait'"
              rows={3}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters • Your report will be analyzed automatically
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Analyzing & Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
