
'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

const faqItems = [
  {
    question: "Comment puis-je trouver un produit ?",
    answer: "Vous pouvez utiliser la barre de recherche en haut de la page pour taper le nom du produit que vous cherchez. Vous pouvez également naviguer à travers nos catégories en utilisant le menu principal pour découvrir nos différentes gammes de produits : téléphonie, informatique, audio, et accessoires."
  },
  {
    question: "Comment passer une commande ?",
    answer: "1. Trouvez le produit que vous souhaitez acheter.\n2. Cliquez sur le bouton 'Ajouter au panier'.\n3. Une fois que vous avez ajouté tous vos articles, cliquez sur l'icône du panier en haut à droite pour voir votre récapitulatif.\n4. Cliquez sur 'Passer la commande' et remplissez vos informations de livraison.\n5. Choisissez votre mode de paiement (actuellement, nous proposons le paiement à la livraison) et finalisez votre commande."
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Pour le moment, nous acceptons uniquement le paiement à la livraison. Vous payez votre commande en espèces directement au livreur lors de la réception de votre colis."
  },
  {
    question: "Comment puis-je suivre ma commande ?",
    answer: "Après avoir passé votre commande, vous recevrez un numéro de commande sur la page de confirmation. Vous pouvez utiliser ce numéro sur notre page de <a href='/suivi' class='underline text-primary'>Suivi de Commande</a> pour voir l'état d'avancement de votre livraison."
  },
  {
    question: "Quelle est votre politique de garantie et de retour ?",
    answer: "Nous offrons une garantie sur nos produits. Pour plus de détails sur les conditions de garantie, les retours et le service après-vente, veuillez consulter notre page <a href='/sav' class='underline text-primary'>Garantie & SAV</a>."
  },
  {
    question: "Comment contacter le service client ?",
    answer: "Notre équipe est là pour vous aider. Vous pouvez nous contacter par téléphone au numéro indiqué en bas de page, ou via WhatsApp pour une réponse rapide. Vous pouvez aussi visiter notre page de contact pour plus d'options."
  },
   {
    question: "Livrez-vous en dehors de Dakar ?",
    answer: "Oui, nous livrons à Dakar et dans les autres régions du Sénégal. Les frais et délais de livraison varient en fonction de votre localité. Les détails seront précisés lors de la finalisation de votre commande."
  }
];

export default function FAQPage() {
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Questions Fréquentes (FAQ)</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Questions Fréquentes (FAQ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-line text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
