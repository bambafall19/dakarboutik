
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Conditions Générales de Vente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Conditions Générales de Vente</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-foreground/80">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-SN')}</p>
          
          <h2 className="text-xl font-semibold text-foreground">1. Objet</h2>
          <p>
            Les présentes conditions générales de vente visent à définir les relations contractuelles entre DakarBoutik et l’acheteur et les conditions applicables à tout achat effectué par le biais du site internet www.dakarboutik.sn. L’acquisition d’un produit à travers le présent site implique une acceptation sans réserve par l’acheteur des présentes conditions de vente dont l’acheteur reconnaît avoir pris connaissance préalablement à sa commande.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Produits</h2>
          <p>
            Les produits proposés sont ceux qui figurent sur le site de DakarBoutik, dans la limite des stocks disponibles. DakarBoutik se réserve le droit de modifier à tout moment l’assortiment de produits. Chaque produit est présenté sur le site internet sous forme d’un descriptif reprenant ses principales caractéristiques techniques. Les photographies sont les plus fidèles possibles mais n’engagent en rien le Vendeur.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Tarifs</h2>
          <p>
            Les prix figurant sur les fiches produits du catalogue internet sont des prix en Francs CFA (FCA) toutes taxes comprises (TTC). DakarBoutik se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable à l’acheteur. Les prix indiqués ne comprennent pas les frais de livraison, facturés en supplément du prix des produits achetés.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">4. Commandes et modalités de paiement</h2>
          <p>
            Le paiement des achats s'effectue à la livraison. Le client peut passer commande sur le site internet. La confirmation d’une commande entraîne acceptation des présentes conditions de vente, la reconnaissance d’en avoir parfaite connaissance et la renonciation à se prévaloir de ses propres conditions d’achat. L’ensemble des données fournies et la confirmation enregistrée vaudront preuve de la transaction.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Livraison</h2>
          <p>
            Les livraisons sont faites à l’adresse indiquée sur le bon de commande qui ne peut être que dans la zone géographique convenue (Sénégal). Les délais de livraison ne sont donnés qu’à titre indicatif ; si ceux-ci dépassent trente jours à compter de la commande, le contrat de vente pourra être résilié et l’acheteur remboursé.
          </p>
          
           <h2 className="text-xl font-semibold text-foreground">6. Rétractation et Garantie</h2>
          <p>
           Tous les produits fournis par DakarBoutik bénéficient de la garantie légale. En cas de non conformité d’un produit vendu, il pourra être retourné à DakarBoutik qui le reprendra, l’échangera ou le remboursera. Toutes les réclamations doivent s'effectuer par voie postale ou par email dans un délai de sept (7) jours après livraison. Pour plus de détails, veuillez consulter notre page <a href="/sav" className="text-primary underline">Garantie & SAV</a>.
          </p>

          <h2 className="text-xl font-semibold text-foreground">7. Responsabilité</h2>
          <p>
            DakarBoutik, dans le processus de vente à distance, n’est tenue que par une obligation de moyens. Sa responsabilité ne pourra être engagée pour un dommage résultant de l’utilisation du réseau Internet tel que perte de données, intrusion, virus, rupture du service, ou autres problèmes involontaires.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
