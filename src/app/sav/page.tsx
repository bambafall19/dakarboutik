
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

export default function SAVPage() {
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Garantie & SAV</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Garantie & SAV</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-foreground/80">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">GARANTIE DU VENDEUR - de 12 à 24 mois (dépendant du fournisseur)</h2>
              <p>
                La garantie du vendeur est fournie par notre société à cause de certaines restrictions de la garantie. La garantie couvre pour 12 mois tout type de défaillance matérielle qui empêche son opérabilité basique. Elle couvre les mêmes issues que la garantie UE. DakarBoutik dispose des services de réparation.
              </p>
              <p>
                Pour plus d&apos;informations concernant la garantie et le SAV, veuillez contacter notre Service clientèle, du lundi au vendredi, de 8h30 à 14h30.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">LA GARANTIE NE COUVRE PAS (dans les deux cas):</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le remplacement ou la défaillance de tout accessoire</li>
                <li>Les défaillances résultant d&apos;une mauvaise utilisation ou toute utilisation non conforme aux instructions affichées. Les clients sont invités à prendre le temps de lire attentivement les instructions pour la bonne utilisation de tous les produits.</li>
                <li>Les défaillances résultant d&apos;un mauvais stockage, non-conforme aux conditions détaillées dans le manuel d&apos;instructions</li>
                <li>Les dommages ou le non-fonctionnement résultant des travaux de réparation inadéquats effectués par un centre de service non-autorisé.</li>
                <li>Les dommages provoqués par l&apos;utilisation d&apos;accessoires non conformes et d&apos;équipements non-professionnels</li>
                <li>Les dommages et le non-fonctionnement résultant des influences externes (comme accidents ou catastrophes naturels)</li>
                <li>Les dommages et le non-fonctionnement des appareils résistants à l&apos;eau causés par l&apos;immersion dans le sel ou dans l&apos;eau chlorée</li>
                <li>Les dommages mécaniques, les dommages dus à un cas de force majeure, ou résultant d&apos;une utilisation dans des conditions inadequates</li>
                <li>Les défauts dont l&apos;acheteur était déjà informé au moment de l&apos;achat</li>
                <li>Les dommages provoqués par l&apos;eau</li>
              </ul>
            </div>
            
            <p>
              DakarBoutik ne sera tenu responsable en aucun cas si les fournisseurs refusent d&apos;accepter la garantie à cause de l&apos;un des motifs énoncés ci-dessus.
            </p>
            <p>
              Dans le cas où la garantie est refusée, le producteur vous fera une proposition pour la réparation du produit. Si le client refuse cette proposition, le producteur a le droit d&apos;exiger que ses dépenses administratives soient couvertes par le client. Si le client décide d&apos;accepter l&apos;offre du producteur, il est obligé de payer le montant total de la facture au producteur.
            </p>
            <p>
              Si le produit n&apos;est pas garanti EU et que la garantie EU ne couvre pas la réparation, vous bénéficiez de la garantie du vendeur. Vous aurez à contacter notre service client qui vous communiquera l&apos;adresse du centre de réparation. Une fois le produit arrivé au service de réparation, celui-ci sera testé afin de déterminer son état, suite à quoi DakarBoutik vous offrira l&apos;une de ces trois options :
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
                <li>Réparation - Constatation de panne et intervention</li>
                <li>Remplacement - Nous vous livrons le même produit à nos frais</li>
                <li>Remboursement (à l&apos;exclusion des frais d&apos;assurance)</li>
            </ul>

            <p>
              DakarBoutik se réserve le droit de proposer au client l&apos;option la plus adéquate compte tenu la particularité de chaque dossier.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
