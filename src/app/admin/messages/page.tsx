'use client';

import { useCallback, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Mail, MailOpen, Trash2 } from 'lucide-react';
import { useApiData } from '@/hooks/use-api-data';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { AdminError } from '@/components/admin/admin-error';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function MessagesAdminPage() {
  const { data, loading, error, refetch } = useApiData<ContactMessage[]>('/api/contact-messages');
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const messages = data || [];
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleToggleRead = useCallback(
    async (message: ContactMessage) => {
      try {
        await api.put('/api/contact-messages', { id: message.id, isRead: !message.isRead });
        await refetch();
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible de modifier le message.",
        });
      }
    },
    [refetch, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!messageToDelete) return;
    try {
      await api.delete('/api/contact-messages?id=' + messageToDelete.id);
      await refetch();
      toast({ title: 'Message supprimé' });
      setMessageToDelete(null);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de supprimer le message.",
      });
    }
  }, [messageToDelete, refetch, toast]);

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Messages</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-headline font-bold">Messages</CardTitle>
              <CardDescription>
                Les messages envoyés depuis la page contact de votre site.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? <Badge>{unreadCount} non lu(s)</Badge> : null}
              <Button size="sm" variant="outline" onClick={refetch} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <AdminError description={error.message} onRetry={refetch} />
          ) : messages.length === 0 ? (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Aucun message</AlertTitle>
              <AlertDescription>
                Les messages envoyés depuis la page contact apparaîtront ici.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl border p-4 transition ${
                    message.isRead
                      ? 'border-border/70 bg-transparent'
                      : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{message.name || 'Visiteur anonyme'}</p>
                        {!message.isRead ? <Badge variant="default">Nouveau</Badge> : null}
                      </div>
                      <a
                        href={`mailto:${message.email}`}
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {message.email}
                      </a>
                      {message.subject ? (
                        <p className="text-sm font-medium">{message.subject}</p>
                      ) : null}
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{message.message}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRead(message)}
                      >
                        {message.isRead ? (
                          <Mail className="mr-2 h-3.5 w-3.5" />
                        ) : (
                          <MailOpen className="mr-2 h-3.5 w-3.5" />
                        )}
                        {message.isRead ? 'Marquer non lu' : 'Marquer lu'}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setMessageToDelete(message)}
                        aria-label="Supprimer le message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!messageToDelete}
        onOpenChange={(open) => !open && setMessageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le message sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
