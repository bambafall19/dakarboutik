'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/use-site-data';
import { Headset, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { buildWhatsAppUrl, getOrderPhoneNumber, getWhatsAppNumber } from '@/lib/order-channels';

function ContactLinks() {
  const { settings, loading } = useSiteSettings();
  const whatsappNumber = getWhatsAppNumber(settings);
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        "Bonjour/Bonsoir Dakarboutik, je souhaite passer une commande. @https://dakarboutik.net/"
      )
    : null;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settings?.supportPhone && (
          <Link
            href={`tel:${getOrderPhoneNumber(settings) ?? settings.supportPhone}`}
            className="flex items-center gap-4 group"
          >
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary transition-colors">
                  <Headset className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                  <h3 className="font-semibold">Appelez-nous pour commander</h3>
                  <p className="text-muted-foreground">{settings.supportPhone}</p>
              </div>
          </Link>
      )}
      {settings?.supportEmail && (
          <Link href={`mailto:${settings.supportEmail}`} className="flex items-center gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary transition-colors">
                  <Mail className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                  <h3 className="font-semibold">Envoyez-nous un email</h3>
                  <p className="text-muted-foreground">{settings.supportEmail}</p>
              </div>
          </Link>
      )}
      {whatsappUrl && (
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                  <h3 className="font-semibold">Commandez sur WhatsApp</h3>
                  <p className="text-muted-foreground">Réponse rapide garantie</p>
              </div>
          </Link>
      )}
    </div>
  )
}

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', lastName: '', email: '', subject: '', message: '' });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/contact-messages', {
                name: `${form.name} ${form.lastName}`.trim(),
                email: form.email,
                subject: form.subject,
                message: form.message,
            });
            setForm({ name: '', lastName: '', email: '', subject: '', message: '' });
            toast({ title: 'Message envoyé !', description: 'Notre équipe vous répondra rapidement.' });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error instanceof Error ? error.message : "Impossible d'envoyer le message.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contactez-nous</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">Entrez en contact</h1>
            <p className="text-muted-foreground">
                Une question ? Une suggestion ? N&apos;hésitez pas à nous contacter via le formulaire ou directement par nos canaux de communication. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <ContactLinks />
        </div>
        <Card className="rounded-2xl border-border/70">
            <CardHeader>
                <CardTitle className="font-headline font-bold">Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">Prénom</Label>
                            <Input id="first-name" name="name" placeholder="Votre prénom" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Nom</Label>
                            <Input id="last-name" name="lastName" placeholder="Votre nom" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="Votre email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Objet</Label>
                        <Input id="subject" name="subject" placeholder="Sujet de votre message" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" placeholder="Votre message..." value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
