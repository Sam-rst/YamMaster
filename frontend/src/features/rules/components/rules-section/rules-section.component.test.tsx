import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesSection from './rules-section.component';

describe('RulesSection', () => {
    const mockToggle = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre et l\'icône quand fermé', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(getByText('🎲')).toBeTruthy();
        expect(getByText('Les Dés')).toBeTruthy();
    });

    test('n\'affiche pas le contenu enfant quand fermé', () => {
        const { queryByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(queryByText('Contenu dés')).toBeNull();
    });

    test('affiche le contenu enfant quand ouvert', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={true} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(getByText('Contenu dés')).toBeTruthy();
    });

    test('appelle onToggle au clic sur le header', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        fireEvent.click(getByText('Les Dés'));
        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    test('affiche le chevron ▶ quand fermé et ▼ quand ouvert', () => {
        const { getByText, rerender } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu</span>
            </RulesSection>
        );

        expect(getByText('▶')).toBeTruthy();

        rerender(
            <RulesSection icon="🎲" title="Les Dés" isOpen={true} onToggle={mockToggle}>
                <span>Contenu</span>
            </RulesSection>
        );

        expect(getByText('▼')).toBeTruthy();
    });
});
