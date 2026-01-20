
'use client';

import React, { useState, useCallback } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFaqs } from '@/hooks/use-site-data';
import type { FaqItem } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Loader2, Info } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { FaqForm } from '@/components/admin/faq-form';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, writeBatch, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
import { initialFaqItems } from '@/lib/faq-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function FaqAdminPage() {
    const { faqs, loading } = useFaqs();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
    const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleAddClick = useCallback(() => {
        setSelectedFaq(null);
        setIsFormOpen(true);
    }, []);

    const handleEditClick = useCallback((faqItem: FaqItem) => {
        setSelectedFaq(faqItem);
        setIsFormOpen(true);
    }, []);

    const handleDeleteClick = useCallback((faqItem: FaqItem) => {
        setFaqToDelete(faqItem);
    }, []);

    const confirmDelete = async () => {
        if (!faqToDelete || !firestore) return;
        
        try {
            await deleteDoc(doc(firestore, 'faq', faqToDelete.id));
            toast({ title: 'Question supprimée' });
            setFaqToDelete(null);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la question.' });
        }
    }

    const handleSeedData = async () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Base de données non connectée.' });
            return;
        }
        setIsSeeding(true);
        try {
            const batch = writeBatch(firestore);
            const faqCollection = collection(firestore, 'faq');
            
            initialFaqItems.forEach(item => {
                const newDocRef = doc(faqCollection);
                batch.set(newDocRef, item);
            });
            
            await batch.commit();
            toast({ title: 'Données initiales ajoutées', description: `${initialFaqItems.length} questions ont été ajoutées à la FAQ.` });
        } catch (error) {
            console.error("Error seeding FAQ data:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter les données initiales.' });
        } finally {
            setIsSeeding(false);
        }
    };


  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Gestion de la FAQ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle>Questions Fréquentes (FAQ)</CardTitle>
                <CardDescription>
                    Gérez les questions et réponses qui apparaissent sur la page FAQ.
                </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddClick}>
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : faqs.length === 0 ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Votre FAQ est vide !</AlertTitle>
                    <AlertDescription>
                        Vous pouvez ajouter des questions manuellement ou importer les questions par défaut pour commencer.
                        <Button onClick={handleSeedData} disabled={isSeeding} className="mt-4" size="sm">
                            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Importer les questions par défaut
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Ordre</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {faqs.map(faq => (
                         <TableRow key={faq.id}>
                            <TableCell>{faq.order}</TableCell>
                            <TableCell className="font-medium">{faq.question}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditClick(faq)}>Modifier</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteClick(faq)}>Supprimer</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      
      <FaqForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        faqItem={selectedFaq}
      />
      <AlertDialog open={!!faqToDelete} onOpenChange={(open) => !open && setFaqToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La question sera définitivement supprimée.
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
