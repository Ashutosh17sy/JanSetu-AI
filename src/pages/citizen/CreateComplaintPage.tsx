import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Sparkles, Upload, X, Loader2, CheckCircle2, Crosshair, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { SeverityBadge, PriorityBadge } from '@/components/ui/StatusBadges';
import { Badge } from '@/components/ui/Badge';
import { LocationPicker } from '@/components/maps/Maps';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { analyzeComplaint } from '@/services/ai';
import { createComplaint, fetchDepartments, uploadImage } from '@/services/api';
import { wardOf, classNames } from '@/services/utils';
import { CATEGORIES } from '@/services/constants';
import type { AIAnalysis, Department } from '@/services/types';

type Phase = 'idle' | 'analyzing' | 'done';

export function CreateComplaintPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [address, setAddress] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please upload an image.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhase('idle');
    setAnalysis(null);
  };

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS unavailable', 'Your browser does not support geolocation.');
      return;
    }
    toast.info('Detecting location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        toast.success('Location detected', 'Your GPS coordinates have been captured.');
      },
      () => toast.error('Location denied', 'Allow location access or pick a spot on the map.'),
    );
  }, [toast]);

  const runAnalysis = async () => {
    if (!file && !note) {
      toast.error('Need more info', 'Upload a photo or add a note so the AI can analyse the issue.');
      return;
    }
    setPhase('analyzing');
    try {
      const result = await analyzeComplaint({
        note,
        address,
        ward: location ? wardOf(location.lat, location.lng) : '',
        fileName: file?.name ?? '',
        latitude: location?.lat,
        longitude: location?.lng,
      });
      setAnalysis(result);
      setPhase('done');
      toast.success('AI analysis complete', 'Category, severity and department detected.');
    } catch (err) {
      setPhase('idle');
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      toast.error('AI analysis failed', msg);
    }
  };

  const submit = async () => {
    if (!profile?.id) return;
    if (!analysis) {
      toast.error('Run AI analysis first', 'Click "Analyse with AI" before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (file) {
        const path = `complaints/${profile.id}/${Date.now()}-${file.name}`;
        imageUrl = await uploadImage('complaints', path, file);
      }
      const dept = departments.find((d) => d.slug === analysis.department_slug) ?? null;
      const ward = location ? wardOf(location.lat, location.lng) : '';
      const complaint = await createComplaint({
        user_id: profile.id,
        category: analysis.category,
        category_slug: analysis.category_slug,
        title: analysis.ai_title,
        description: note || analysis.ai_description,
        ai_title: analysis.ai_title,
        ai_description: analysis.ai_description,
        ai_summary: analysis.ai_summary,
        severity: analysis.severity,
        priority: analysis.priority,
        department_id: dept?.id ?? null,
        recommended_department_id: dept?.id ?? null,
        duplicate_of: analysis.duplicate_of,
        image_url: imageUrl,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        address,
        ward,
      });
      toast.success('Complaint submitted', `Ticket ${complaint.ticket_number} created.`);
      navigate(`/app/complaints/${complaint.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      toast.error('Submission failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report a Civic Issue"
        subtitle="Upload a photo, drop a pin, and let AI classify and route your complaint."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                1. Upload a photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="mx-auto max-h-72 rounded-xl object-contain" />
                  <button
                    onClick={() => { setFile(null); setPreview(''); setPhase('idle'); setAnalysis(null); }}
                    className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-12 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload</p>
                    <p className="text-xs">PNG, JPG up to 10MB</p>
                  </div>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                2. Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" leftIcon={<Crosshair className="h-4 w-4" />} onClick={detectGPS}>
                  Detect my GPS
                </Button>
                {location && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" dot="bg-emerald-500">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </Badge>
                )}
              </div>
              <LocationPicker value={location} onChange={(v) => setLocation(v)} height="280px" />
              <Input
                label="Address (optional)"
                placeholder="e.g. Near Sector 18 market, Noida"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardHeader>
              <CardTitle>3. Describe the issue (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any details that will help officers — e.g. 'Deep pothole near the school crossing, dangerous for two-wheelers.'"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: AI panel */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runAnalysis}
                loading={phase === 'analyzing'}
                leftIcon={phase !== 'analyzing' ? <Sparkles className="h-4 w-4" /> : undefined}
                className="w-full"
              >
                {phase === 'analyzing' ? 'Analysing…' : 'Analyse with AI'}
              </Button>

              <AnimatePresence mode="wait">
                {phase === 'analyzing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {['Detecting category…', 'Estimating severity…', 'Recommending department…', 'Checking for duplicates…'].map((s, i) => (
                      <div key={s} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ animationDelay: `${i * 150}ms` }} />
                        {s}
                      </div>
                    ))}
                  </motion.div>
                )}

                {phase === 'done' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Analysis complete</span>
                    </div>

                    {analysis.duplicate_of && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span className="text-xs text-amber-800 dark:text-amber-200">
                          A similar complaint exists nearby. This may be a duplicate.
                        </span>
                      </div>
                    )}

                    {[
                      { label: 'Category', value: analysis.category },
                      { label: 'Department', value: analysis.department_name },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Severity</span>
                      <SeverityBadge severity={analysis.severity} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
                      <PriorityBadge priority={analysis.priority} />
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI-generated title</p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{analysis.ai_title}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI summary</p>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{analysis.ai_summary}</p>
                    </div>

                    <Button onClick={submit} loading={submitting} className="w-full" size="lg">
                      Submit complaint
                    </Button>
                  </motion.div>
                )}

                {phase === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center"
                  >
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Upload a photo and click <span className="font-medium text-slate-700 dark:text-slate-200">Analyse with AI</span> to auto-detect the issue.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <span
                    key={c.slug}
                    className={classNames(
                      'rounded-full px-2 py-0.5 text-xs',
                      analysis?.category_slug === c.slug
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    )}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
