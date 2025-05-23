
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSReport {
  phone: string;
  message: string;
  location: 'likoni' | 'mtongwe';
}

interface BreakdownAnalysis {
  is_breakdown: boolean;
  confidence: number;
  status: 'operational' | 'delayed' | 'broken';
  alternative_routes?: string;
  reasoning: string;
}

const analyzeBreakdown = (message: string): BreakdownAnalysis => {
  const text = message.toLowerCase();
  
  const breakdownKeywords = [
    'broken', 'stuck', 'not moving', 'mechanical', 'engine', 'fault',
    'breakdown', 'repair', 'maintenance', 'stopped', 'dead', 'kaput',
    'imesimama', 'imeharibika', 'hawaitembei'
  ];
  
  const delayKeywords = [
    'slow', 'delayed', 'late', 'waiting', 'queue', 'long line',
    'chelewa', 'subiri', 'foleni'
  ];
  
  const operationalKeywords = [
    'running', 'working', 'moving', 'operating', 'normal', 'fine',
    'inafanya kazi', 'inatembea', 'sawa'
  ];

  let breakdownMatches = 0;
  let delayMatches = 0;
  let operationalMatches = 0;

  breakdownKeywords.forEach(keyword => {
    if (text.includes(keyword)) breakdownMatches++;
  });

  delayKeywords.forEach(keyword => {
    if (text.includes(keyword)) delayMatches++;
  });

  operationalKeywords.forEach(keyword => {
    if (text.includes(keyword)) operationalMatches++;
  });

  const totalWords = text.split(' ').length;
  const totalMatches = breakdownMatches + delayMatches + operationalMatches;
  
  if (breakdownMatches > 0) {
    return {
      is_breakdown: true,
      confidence: Math.min(0.9, (breakdownMatches / totalWords) * 5),
      status: 'broken',
      alternative_routes: 'Dongo Kundu Bridge (30 mins, KSh 150)',
      reasoning: 'Breakdown keywords detected'
    };
  }
  
  if (delayMatches > operationalMatches) {
    return {
      is_breakdown: false,
      confidence: Math.min(0.8, (delayMatches / totalWords) * 4),
      status: 'delayed',
      reasoning: 'Delay indicators found'
    };
  }
  
  if (operationalMatches > 0) {
    return {
      is_breakdown: false,
      confidence: Math.min(0.7, (operationalMatches / totalWords) * 3),
      status: 'operational',
      reasoning: 'Operational indicators found'
    };
  }

  return {
    is_breakdown: false,
    confidence: 0.3,
    status: 'operational',
    reasoning: 'No clear indicators found, assuming operational'
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { phone, message, location }: SMSReport = await req.json();

    // Validate input
    if (!phone || !message || !location) {
      throw new Error('Missing required fields: phone, message, location');
    }

    if (!['likoni', 'mtongwe'].includes(location)) {
      throw new Error('Invalid location. Must be "likoni" or "mtongwe"');
    }

    // Analyze the message for breakdown detection
    const analysis = analyzeBreakdown(message);

    // Insert the report with analysis results
    const { data: report, error: insertError } = await supabaseClient
      .from('reports')
      .insert({
        phone,
        message,
        location,
        breakdown_detected: analysis.is_breakdown,
        confidence_score: analysis.confidence,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update operational status if breakdown detected with high confidence
    if (analysis.is_breakdown && analysis.confidence > 0.7) {
      const { error: statusError } = await supabaseClient
        .from('operational_status')
        .update({
          health_status: analysis.status,
          updated_at: new Date().toISOString()
        })
        .eq('location', location);

      if (statusError) console.error('Error updating status:', statusError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report.id,
        analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing SMS:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
