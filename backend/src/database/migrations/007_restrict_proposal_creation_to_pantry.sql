-- Migration: Restrict proposal creation to Pantry only
-- Only Pantry users should be able to create governance proposals
-- Students and Suppliers can only vote on proposals

-- Drop the old constraint
ALTER TABLE governance_proposals 
DROP CONSTRAINT IF EXISTS governance_proposals_proposed_by_entity_check;

-- Add new constraint allowing only 'pantry'
ALTER TABLE governance_proposals 
ADD CONSTRAINT governance_proposals_proposed_by_entity_check 
CHECK (proposed_by_entity IN ('pantry'));

-- Update any existing proposals from non-pantry entities to be from pantry
-- (This shouldn't exist in production, but helps clean up test data)
UPDATE governance_proposals 
SET proposed_by_entity = 'pantry', 
    proposed_by_user = (SELECT id FROM users WHERE role = 'pantry' LIMIT 1)
WHERE proposed_by_entity != 'pantry';

-- Add comment for documentation
COMMENT ON COLUMN governance_proposals.proposed_by_entity IS 
'The entity type that proposed this governance proposal. Only pantry can create proposals.';

