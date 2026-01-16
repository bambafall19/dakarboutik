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

export default function ContactPage() {
    const { settings } = useSiteSettings();

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
            <h1 className="text-3xl md:text-4xl font-bold">Entrez en contact</h1>
            <p className="text-muted-foreground">
                Une question ? Une suggestion ? N'hésitez pas à nous contacter via le formulaire ou directement par nos canaux de communication. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <div className="space-y-4">
                {settings?.supportPhone && (
                    <Link href={`tel:${settings.supportPhone}`} className="flex items-center gap-4 group">
                        <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary transition-colors">
                            <Headset className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Appelez-nous</h3>
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
                {settings?.whatsappNumber && (
                    <Link href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="flex items-center gap-4 group">
                        <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary transition-colors">
                            <MessageCircle className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Discutez sur WhatsApp</h3>
                            <p className="text-muted-foreground">Réponse rapide garantie</p>
                        </div>
                    </Link>
                )}
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">Prénom</Label>
                            <Input id="first-name" placeholder="Votre prénom" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Nom</Label>
                            <Input id="last-name" placeholder="Votre nom" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Votre email" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Votre message..." />
                    </div>
                    <Button type="submit" className="w-full">Envoyer le message</Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
