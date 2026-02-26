import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import z from 'zod';

interface UtmBuilderProps {
  shortLink: string;
}

const utm_schema = z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
})

export function UtmBuilder({ shortLink }: UtmBuilderProps) {
  const [utm, setUtm] = useState({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });

  const [finalUrl, setFinalUrl] = useState(shortLink);

  useEffect(() => {
    try {
      const url = new URL(shortLink);
      if (utm.source) url.searchParams.set('utm_source', utm.source);
      if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
      if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
      if (utm.term) url.searchParams.set('utm_term', utm.term);
      if (utm.content) url.searchParams.set('utm_content', utm.content);
      
      setFinalUrl(url.toString());
    } catch (e) {
      setFinalUrl(shortLink);
    }
  }, [utm, shortLink]);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    toast.success('Dynamic link copied to clipboard!');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <LinkIcon className="w-4 h-4" /> Share with UTMs
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Source (e.g. twitter)</Label>
          <Input 
            value={utm.source} 
            onChange={e => setUtm({...utm, source: e.target.value})} 
            placeholder="twitter"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Medium (e.g. social)</Label>
          <Input 
            value={utm.medium} 
            onChange={e => setUtm({...utm, medium: e.target.value})} 
            placeholder="social"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Term (Keywords)</Label>
          <Input 
            value={utm.term} 
            onChange={e => setUtm({...utm, term: e.target.value})} 
            placeholder="running+shoes"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Campaign (Promo)</Label>
          <Input 
            value={utm.campaign} 
            onChange={e => setUtm({...utm, campaign: e.target.value})} 
            placeholder="spring_sale"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Content</Label>
          <Input 
            value={utm.content} 
            onChange={e => setUtm({...utm, content: e.target.value})} 
            placeholder="banner_ad"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-md border flex items-start justify-between gap-3">
        <span className="text-sm font-mono text-muted-foreground break-all">
          {finalUrl}
        </span>
        
        <Button size="sm" onClick={handleCopy} className="shrink-0 mt-0.5">
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
      </div>
    </div>
  );
}