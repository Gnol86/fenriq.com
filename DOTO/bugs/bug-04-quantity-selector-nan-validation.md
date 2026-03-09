# BUG #4 — QuantitySelector accepte des valeurs invalides / NaN

## Priority
haute

## Area
quota / quantity selector

## Page
/dashboard/org/subscription

## Summary
La validation utilise Number.isNaN sur une string et laisse passer NaN après parse.

## Reproduction
- Sur un plan avec quantité éditable, saisir une valeur non numérique dans l'input.
- Observer la valeur calculée / le comportement du composant.

## Expected
Les entrées invalides doivent être rejetées ou normalisées proprement.

## Actual
Une valeur NaN peut être propagée.

## Impact
Comportement indéfini, risque de crash UI ou checkout incohérent.

## Likely cause
Usage de Number.isNaN(value) au lieu de Number.isNaN(Number(value)).

## Files
- src/components/quantity-selector.jsx

## Proposed fix
- Valider Number(value).
- Bloquer les caractères invalides et fallback sur la dernière valeur valide.
