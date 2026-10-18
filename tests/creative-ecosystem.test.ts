import { describe, expect, it } from 'vitest';
import {
  assetIsApproved,
  cleanAsset,
  cleanCreatorApplication,
  creatorTransition,
  destinationReadiness,
  grantAllowsScope,
  kitReadiness,
  partnerTransition,
  requiredAssetSlots,
} from '../src/lib/ecosystem/model';
import type { CreativeAsset, Destination, LocalPartner } from '../src/lib/ecosystem/types';

const asset = (key: string, overrides: Partial<CreativeAsset> = {}): CreativeAsset => {
  const [slot, slotIndex] = key.split(':') as [CreativeAsset['slot'], string];
  return {
    id: key,
    scope: 'studio',
    kitId: '00000000-0000-4000-8000-000000000001',
    destinationId: '00000000-0000-4000-8000-000000000002',
    creatorId: '00000000-0000-4000-8000-000000000003',
    slot,
    slotIndex: Number(slotIndex),
    title: key,
    description: 'A documented original.',
    location: 'Atlas',
    credit: 'Visual Poet',
    rightsSummary: 'Public Journey usage.',
    rightsEvidence: 'licence-001',
    rightsScope: 'public_journeys',
    rightsExpiresAt: '2099-01-01',
    originalSourceUrl: 'https://example.com/original',
    aiDisclosure: 'none_declared',
    softFadeConsent: true,
    width: slot === 'hero' ? 1920 : 1600,
    height: slot === 'hero' ? 1080 : 1200,
    mediaId: '00000000-0000-4000-8000-000000000004',
    publicMediaId: null,
    durationSeconds: slot === 'hero' ? 20 : slot === 'reel' ? 12 : null,
    status: 'approved',
    authenticity: 'approved',
    rights: 'approved',
    safety: 'approved',
    humanCreative: 'approved',
    reviewNote: '',
    version: 1,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
};

const partner = (
  type: LocalPartner['type'],
  overrides: Partial<LocalPartner> = {}
): LocalPartner => ({
  id: type,
  scope: 'studio',
  destinationId: '00000000-0000-4000-8000-000000000002',
  name: type,
  type,
  description: 'Verified local relationship.',
  contactName: 'QA Partner Contact',
  contactEmail: 'partner@example.com',
  contactPhone: '',
  website: 'https://example.com/partner',
  collaborationType: 'paid',
  exchangeValueAmount: null,
  exchangeTerms: '',
  deliverables: '',
  status: 'ready_to_sell',
  evidenceReference: 'evidence-001',
  quoteReference: 'quote-001',
  budgetAmount: 100,
  budgetCurrency: 'EUR',
  availabilityNote: 'Available during the Journey window.',
  safetyNote: 'Risk and emergency contacts reviewed.',
  productionValidated: true,
  impactNote: 'Documented local outcome.',
  version: 1,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe('Visual Poets ecosystem rules', () => {
  it('keeps demo-only CRM grants out of the studio catalogue', () => {
    expect(grantAllowsScope({ demo_only: true }, 'studio')).toBe(false);
    expect(grantAllowsScope({ demo_only: true }, 'demo')).toBe(true);
    expect(grantAllowsScope({ demo_only: false }, 'studio')).toBe(true);
  });
  it('requires the exact 1 Hero, 3 Reels and 10 photos instead of a raw count', () => {
    const complete = requiredAssetSlots.map((key) => asset(key));
    expect(kitReadiness(complete)).toMatchObject({ ready: true, approved: 14, required: 14 });
    const duplicatePhoto = complete.map((item) => ({ ...item }));
    duplicatePhoto[13] = asset('photo:9', { id: 'duplicate' });
    const result = kitReadiness(duplicatePhoto);
    expect(result.ready).toBe(false);
    expect(result.missing).toContain('photo:10');
    expect(result.invalid).toContain('photo:9');
  });

  it('invalidates only the rejected or replacement asset', () => {
    const complete = requiredAssetSlots.map((key) => asset(key));
    complete[4] = asset('photo:1', {
      status: 'needs_replacement',
      authenticity: 'rejected',
    });
    const result = kitReadiness(complete);
    expect(result.approved).toBe(13);
    expect(result.invalid).toEqual(['photo:1']);
  });

  it('enforces 15–30 seconds for the Hero while preserving other formats', () => {
    const base = {
      title: 'Hero',
      description: 'Story',
      location: 'Atlas',
      credit: 'Poet',
      rightsSummary: 'Public use',
      rightsEvidence: 'licence',
      rightsScope: 'public_journeys',
      rightsExpiresAt: '2099-01-01',
      originalSourceUrl: 'https://example.com/source',
      aiDisclosure: 'none_declared',
      softFadeConsent: true,
      width: 1920,
      height: 1080,
    };
    expect(() => cleanAsset({ ...base, durationSeconds: 14 }, 'hero')).toThrow(/15–30/);
    expect(cleanAsset({ ...base, durationSeconds: 20 }, 'hero').durationSeconds).toBe(20);
  });

  it('blocks expired, brand-only and AI-generated assets from readiness', () => {
    expect(assetIsApproved(asset('photo:1', { rightsExpiresAt: '2020-01-01' }))).toBe(false);
    expect(assetIsApproved(asset('photo:1', { rightsScope: 'brand_presentation' }))).toBe(false);
    expect(assetIsApproved(asset('photo:1', { aiDisclosure: 'ai_generated' }))).toBe(false);
    expect(
      assetIsApproved(
        asset('photo:1', {
          scope: 'demo',
          aiDisclosure: 'ai_generated',
          authenticity: 'rejected',
          humanCreative: 'rejected',
          reviewNote: 'AI demonstration only; no real-world authenticity certification.',
        })
      )
    ).toBe(true);
  });

  it('keeps creator approval staged and reserves it for Studio', () => {
    expect(() => creatorTransition('requested', 'approved', 'bee')).toThrow();
    expect(() => creatorTransition('requested', 'review', 'creator')).toThrow();
    expect(creatorTransition('requested', 'review', 'curator')).toBe('review');
    expect(creatorTransition('review', 'approved', 'bee')).toBe('approved');
    expect(creatorTransition('approved', 'active', 'curator')).toBe('active');
  });

  it('requires creator languages and covered destinations', () => {
    expect(() =>
      cleanCreatorApplication({
        displayName: 'Poet',
        homeDestination: 'Agadir',
        portfolioUrl: 'https://example.com',
        biography: 'Documentary creator.',
        languages: [],
        coveredDestinations: ['Souss-Massa'],
      })
    ).toThrow();
  });

  it('cannot mark a partner ready without production evidence and availability', () => {
    const candidate = partner('transport', {
      status: 'impact_documented',
      productionValidated: false,
    });
    expect(() => partnerTransition(candidate, 'ready_to_sell', 'curator')).toThrow();
    expect(() =>
      partnerTransition(
        {
          ...candidate,
          collaborationType: 'content_exchange',
          productionValidated: true,
        },
        'ready_to_sell',
        'production'
      )
    ).toThrow(/exchange terms/);
    expect(
      partnerTransition({ ...candidate, productionValidated: true }, 'ready_to_sell', 'production')
    ).toBe('ready_to_sell');
  });

  it('computes destination readiness across creative, production, local and impact gates', () => {
    const destination: Destination = {
      id: '00000000-0000-4000-8000-000000000002',
      scope: 'studio',
      title: 'Atlas',
      country: 'Morocco',
      territory: 'High Atlas',
      description: 'Journey',
      creativeDirectionApproved: true,
      productionApproved: true,
      globalBudgetReference: 'budget-001',
      version: 1,
      createdAt: '',
      updatedAt: '',
    };
    const result = destinationReadiness(
      destination,
      [{ readiness: kitReadiness(requiredAssetSlots.map((key) => asset(key))) }],
      [partner('transport'), partner('food'), partner('hospitality'), partner('association')]
    );
    expect(result.ready).toBe(true);
    expect(
      destinationReadiness(destination, [{ readiness: kitReadiness([]) }], [partner('transport')])
        .ready
    ).toBe(false);
  });
});
