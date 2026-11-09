# Blind-critic rubric

Run this with a cheaper sub-agent (for example Sonnet) **three times per room** and average the scores. The critic sees **only images**: the room's approved reference image, the general style references (`ref_a`–`ref_d`), and a fresh first-person render of the stop. It never sees code or intent.

## Prompt (paste as is)
> You are a strict, blind art critic. View only the PNGs listed, using Read. For each candidate, compare it with its reference image (reference = 10/10). Ignore small gold diamonds, number labels, room banners and UI buttons; they are intentional. Before naming a fix, confirm the feature is really missing. Score each criterion 0–10, give a weighted total, and list the two most important concrete fixes (which object, what's wrong, how to fix it). Reply as JSON: `{room, scores:{…}, total, fixes:[…]}`.

## Criteria and weights
| Criterion | Weight | 10 looks like |
|---|---|---|
| **Object match** | 25% | All five reference objects are present, recognisable from their outline, and the right size |
| **Layout match** | 15% | Objects sit in the reference's arrangement: near-left, far-left, far-right, near-right, centre |
| **Material and texture** | 15% | Wood grain, cloth, glazed or painted pottery, plaster and stone. No flat untextured surfaces |
| **Lighting and mood** | 15% | Warm, soft key light, believable shadows, interiors lit. Nothing muddy or black |
| **Density and clutter** | 10% | Supporting props make the scene feel lived-in without hiding the five objects |
| **Framing** | 10% | All five objects in view at the stop, nothing cut off, nothing blocking the view |
| **Craft** | 10% | No floating, clipping, bulging, z-fighting or stretched textures |

**Pass:** an average of **8.0 or more across three runs**, with no single criterion below 6.
**Report:** the mean, the spread (max minus min), and the two fixes cited most often across the three runs.

Scores drift by about ±1 between runs, so judge the trend, not one number. When the critic and the owner disagree, the owner wins.
