
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const SMSTestPanel: React.FC = () => {
  const [phone, setPhone] = useState('+254712345678');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<'likoni' | 'mtongwe'>('likoni');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testMessages = [
    { text: 'Ferry imesimama, engine problem', type: 'Breakdown' },
    { text: 'Very long queue, waiting 45 minutes', type: 'Delay' },
    { text: 'Ferry working normally today', type: 'Operational' },
    { text: 'Stuck at the dock, not moving', type: 'Breakdown' },
    { text: 'Foleni ndefu sana leo', type: 'Delay (Swahili)' }
  ];

  const testSMSProcessing = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-sms', {
        body: {
          phone,
          message: message.trim(),
          location
        }
      });

      if (error) throw error;
      setResult(data);
    } catch (error) {
      console.error('Error testing SMS:', error);
      setResult({ error: error.message || 'Failed to process SMS' });
    } finally {
      setLoading(false);
    }
  };

  const useTestMessage = (testMsg: string) => {
    setMessage(testMsg);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SMS Processing Test Panel</CardTitle>
        <p className="text-sm text-gray-600">
          Test the SMS analysis without needing real SMS integration
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Select value={location} onValueChange={(value: 'likoni' | 'mtongwe') => setLocation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likoni">Likoni</SelectItem>
                <SelectItem value="mtongwe">Mtongwe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Test Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter SMS message to test..."
            rows={3}
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Quick Test Messages:</p>
          <div className="flex flex-wrap gap-2">
            {testMessages.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useTestMessage(test.text)}
                className="text-xs"
              >
                {test.type}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={testSMSProcessing}
          disabled={loading || !message.trim()}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Test SMS Analysis'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Analysis Result:</h4>
            {result.error ? (
              <div className="text-red-600">{result.error}</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={
                    result.analysis?.status === 'broken' ? 'bg-red-100 text-red-800' :
                    result.analysis?.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {result.analysis?.status || 'unknown'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Breakdown Detected:</span>
                  <span className={`ml-2 ${result.analysis?.is_breakdown ? 'text-red-600' : 'text-green-600'}`}>
                    {result.analysis?.is_breakdown ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Confidence:</span>
                  <span className="ml-2">{(result.analysis?.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Reasoning:</span>
                  <span className="ml-2 text-gray-600">{result.analysis?.reasoning}</span>
                </div>
                {result.analysis?.alternative_routes && (
                  <div>
                    <span className="text-sm font-medium">Alternative Route:</span>
                    <span className="ml-2 text-blue-600">{result.analysis.alternative_routes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSTestPanel;
