
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Politique de Confidentialité</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Politique de Confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-foreground/80">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-SN')}</p>

          <p>
            La présente Politique de Confidentialité décrit la manière dont DakarBoutik collecte, utilise et protège les informations que vous nous fournissez lorsque vous utilisez notre site web.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">1. Collecte de l'information</h2>
          <p>
            Nous collectons des informations lorsque vous passez une commande sur notre site. Les informations collectées incluent votre nom, votre adresse e-mail, votre numéro de téléphone, et votre adresse de livraison.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Utilisation des informations</h2>
          <p>
            Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Traiter vos transactions et livrer vos commandes.</li>
            <li>Améliorer le service client et vos besoins de prise en charge.</li>
            <li>Vous contacter par e-mail ou par téléphone concernant votre commande.</li>
            <li>Personnaliser votre expérience et répondre à vos besoins individuels.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">3. Confidentialité du commerce en ligne</h2>
          <p>
            Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n’importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et / ou une transaction, comme par exemple pour expédier une commande.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Protection des informations</h2>
          <p>
            Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons une connexion sécurisée pour la transmission des informations sensibles. Seuls les employés qui ont besoin d’effectuer un travail spécifique (par exemple, la facturation ou le service à la clientèle) ont accès aux informations personnelles identifiables.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">5. Consentement</h2>
          <p>
            En utilisant notre site, vous consentez à notre politique de confidentialité.
          </p>
          
           <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via notre page de <a href="/contact" className="text-primary underline">contact</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
