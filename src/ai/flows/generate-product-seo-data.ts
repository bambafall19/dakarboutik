'use server';

/**
 * @fileOverview Generates SEO-friendly meta titles and descriptions for products using AI.
 *
 * - generateProductSeoData - A function that generates SEO data for a product.
 * - GenerateProductSeoDataInput - The input type for the generateProductSeoData function.
 * - GenerateProductSeoDataOutput - The return type for the generateProductSeoData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductSeoDataInputSchema = z.object({
  title: z.string().describe('The title of the product.'),
  description: z.string().describe('The description of the product.'),
  brand: z.string().describe('The brand of the product.'),
  category: z.string().describe('The category of the product.'),
  relatedProducts: z
    .array(z.string())
    .describe('List of related product titles, if any.'),
});
export type GenerateProductSeoDataInput = z.infer<
  typeof GenerateProductSeoDataInputSchema
>;

const GenerateProductSeoDataOutputSchema = z.object({
  metaTitle: z.string().describe('The SEO-friendly meta title for the product.'),
  metaDescription: z
    .string()
    .describe('The SEO-friendly meta description for the product.'),
});
export type GenerateProductSeoDataOutput = z.infer<
  typeof GenerateProductSeoDataOutputSchema
>;

export async function generateProductSeoData(
  input: GenerateProductSeoDataInput
): Promise<GenerateProductSeoDataOutput> {
  return generateProductSeoDataFlow(input);
}

const generateProductSeoDataPrompt = ai.definePrompt({
  name: 'generateProductSeoDataPrompt',
  input: {schema: GenerateProductSeoDataInputSchema},
  output: {schema: GenerateProductSeoDataOutputSchema},
  prompt: `You are an SEO expert specializing in creating compelling meta titles and descriptions for e-commerce product pages.

  Given the following product information, generate an SEO-friendly meta title and meta description.

  Product Title: {{{title}}}
  Description: {{{description}}}
  Brand: {{{brand}}}
  Category: {{{category}}}
  {{#if relatedProducts}}
  Consider these related products when creating the description: {{#each relatedProducts}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  {{/if}}

  Meta Title should be concise and under 60 characters.
  Meta Description should be engaging and under 160 characters.
  Focus on keywords that potential customers would use when searching for this product.
  The meta title should include the product title and brand, and category, where appropriate.
  The meta description should highlight the key features and benefits of the product.
  The meta description should be a complete sentence or two and written in a conversational tone.
  The meta description should not be a list of keywords.
  `,
});

const generateProductSeoDataFlow = ai.defineFlow(
  {
    name: 'generateProductSeoDataFlow',
    inputSchema: GenerateProductSeoDataInputSchema,
    outputSchema: GenerateProductSeoDataOutputSchema,
  },
  async input => {
    const {output} = await generateProductSeoDataPrompt(input);
    return output!;
  }
);
