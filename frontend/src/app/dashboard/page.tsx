'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  MoreVertical, Copy, ExternalLink, BarChart2,
  Edit, Trash, Check, Activity, Plus, Link2,
  MousePointerClick, TrendingUp,
  Share2,
  Lock,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { UrlDetailsDropdown } from '@/components/UrlDetailsDropdown';
import { UtmBuilder } from '@/components/UtmBuilder';
import { useAuthStore } from '@/store/authStore';

interface UrlData {
  shortId: string;
  customAlias?: string;
  originalUrl: string;
  totalClicks: number;
  isActive: boolean;
  createdAt?: string;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [shareModalUrl, setShareModalUrl] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isPremium = user?.subscriptionPlan !== 'FREE';

  useEffect(() => {
    api.get('/user/urls')
      .then((res) => {
        setUrls(res.data.urls || []);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load URLs');
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleActive = async (shortId: string, current: boolean) => {
    try {
      await api.patch(`/url/update/${shortId}`, { isActive: !current });
      setUrls(prev => prev.map(u => u.shortId === shortId ? { ...u, isActive: !current } : u));
      toast.success(`Link ${!current ? 'activated' : 'paused'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const deleteUrl = async (shortId: string) => {
    if (!confirm('Delete this link permanently?')) return;
    try {
      await api.delete(`/url/delete/${shortId}`);
      setUrls(prev => prev.filter(u => u.shortId !== shortId));
      toast.success('Link deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalClicks = urls.reduce((s, u) => s + u.totalClicks, 0);
  const activeCount = urls.filter(u => u.isActive).length;

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-16 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="brand-gradient">My Links</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, analyse, and share your shortened URLs.
          </p>
        </div>
        <Button
          onClick={() => router.push('/urls/create')}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create Link
        </Button>
      </div>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Link2, label: 'Total links', value: urls.length, color: 'text-indigo-400' },
            { icon: MousePointerClick, label: 'Total clicks', value: totalClicks.toLocaleString(), color: 'text-violet-400' },
            { icon: TrendingUp, label: 'Active links', value: activeCount, color: 'text-emerald-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl card-gradient border border-white/[0.07] p-4 flex items-center gap-3">
              <span className={`p-2 rounded-lg bg-muted/60 ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-bold text-lg tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] card-gradient overflow-hidden shadow-sm shadow-black/20">
        {urls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No links yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              Create your first short link and start tracking clicks in real-time.
            </p>
            <Button
              onClick={() => router.push('/urls/create')}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Create your first link
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            <div className="hidden sm:grid grid-cols-[1fr_120px_100px_56px] items-center px-5 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Link</span>
              <span className="text-center">Clicks</span>
              <span className="text-center">Status</span>
              <span />
            </div>

            {urls.map((url) => {
              const shortId = url.customAlias || url.shortId;
              const shortUrl = typeof window !== 'undefined'
                ? `${window.location.protocol}//${window.location.host}/url/${shortId}`
                : `/url/${shortId}`;

              return (
                <div key={url.shortId}>
                  {/* Main row */}
                  <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_56px] items-center px-5 py-4 gap-3 hover:bg-muted/20 transition-colors">
                    {/* Link info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <button
                          onClick={() => window.open(shortUrl, '_blank')}
                          className="font-semibold text-sm text-primary hover:underline truncate max-w-55 sm:max-w-xs text-left"
                          title={shortUrl}
                        >
                          {shortUrl.replace(/^https?:\/\//, '')}
                        </button>
                        <button
                          onClick={() => copyToClipboard(shortUrl)}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-50 sm:max-w-sm">
                        {url.originalUrl}
                      </p>
                    </div>

                    {/* Clicks */}
                    <div className="hidden sm:flex justify-center">
                      <span className="font-bold tabular-nums text-sm">{url.totalClicks.toLocaleString()}</span>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:flex justify-center">
                      <Badge
                        variant={url.isActive ? 'default' : 'outline'}
                        className={`text-xs font-medium ${url.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'text-muted-foreground'
                          }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${url.isActive ? 'bg-emerald-400' : 'bg-muted-foreground/50'}`} />
                        {url.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end col-span-1 sm:col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem disabled={!isPremium} className='flex justify-between' onClick={() => router.push(`/analytics/${url.shortId}`)}>
                            <span className='flex gap-2'><BarChart2 className="h-4 w-4" /> Analytics</span>
                            {!isPremium && <Lock className="ml-1 h-3 w-3 text-muted-foreground" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={!isPremium} className='flex justify-between' onClick={() => setShareModalUrl(shortUrl)}>
                            <span className='flex gap-2'><Share2 className="h-4 w-4" /> Share & UTMs</span>
                            {!isPremium && <Lock className="ml-1 h-3 w-3 text-muted-foreground" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(shortUrl, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Visit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(shortUrl)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/urls/${url.shortId}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(url.shortId, url.isActive)}>
                            {url.isActive
                              ? <><Activity className="mr-2 h-4 w-4" /> Pause</>
                              : <><Check className="mr-2 h-4 w-4" /> Activate</>
                            }
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => deleteUrl(url.shortId)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <UrlDetailsDropdown shortId={url.shortId} destinationUrl={shortUrl} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Dialog open={!!shareModalUrl} onOpenChange={(open) => !open && setShareModalUrl(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Track your traffic</DialogTitle>
            <DialogDescription>
              Add dynamic UTM parameters to this link before you share it to track exactly where your clicks are coming from.
            </DialogDescription>
          </DialogHeader>

          {/* Inject the UTM Builder component and pass it the active URL */}
          {shareModalUrl && <UtmBuilder shortLink={shareModalUrl} />}

        </DialogContent>
      </Dialog>
    </div>
  );
}