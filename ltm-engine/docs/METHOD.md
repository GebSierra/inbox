# The LTM memorization method (spec)

The owner's method for memorizing a book of the Bible with a location-triggered memory palace (LTM). **Every build must follow this exactly.** `tools/validate-book.mjs` and `tests/acceptance.mjs` enforce the parts that can be checked.

| # | Rule | Exact meaning | Memory-science basis |
|---|---|---|---|
| 1 | **Rote first** | Before placing a verse, the learner reads it aloud 10–20 times until they can say it roughly. Locations then fix and order what is already learned. | Repeated retrieval strengthens memory more than restudy alone (Roediger & Karpicke, 2006). The method of loci is strongest for *ordered* recall of material already encoded (Bower, 1970). |
| 2 | **One district per chapter** | Each chapter gets its own distinct area (market, temple, house…). No district holds two chapters. | Distinct contexts reduce interference between similar lists. Spatial chunking supports serial recall (Bower, 1970; Legge et al., 2012). |
| 3 | **Rooms of five verses** | A chapter of *n* verses has ceil(*n*/5) rooms. Room *k* holds verses 5*k*−4 … 5*k*; the last room may hold fewer. | Small, fixed-size chunks fit working-memory limits and give each room a predictable address (Cowan, 2001). |
| 4 | **Each verse on an object** | Each verse is tied to one distinct, interesting object *inside* the room, never to empty floor. Objects should be unique across the book where possible. | Loci must be distinctive and well separated to avoid confusion (Bower, 1970; Yates, 1966). |
| 5 | **Fixed order within a room** | As seen standing in front of the room: **1 near-left → 2 far-left → 3 far-right → 4 near-right → 5 centre.** Spot 5 is a centre object (an altar, a seal, a table) standing in the middle of the square formed by spots 1–4. **At a market stall** with no central object, the spot-5 *marker* sits at the centre of the square, between the crates. A room with fewer than five verses uses spots 1, 2, 3… in that order and leaves the rest empty. | A constant traversal order is what turns the method of loci into a serial-recall tool (Bower, 1970; Dresler et al., 2017). |
| 6 | **Rooms in a district run clockwise** | Start at the room nearest the district entrance on the left, go up the left side, then come back down the right. Gates and wells can be rooms. | The same: one fixed route through the whole palace. |
| 7 | **Learners make their own vivid images** | Show at most one or two example images, phrased "for example, you could picture…". Images should be bigger than life, funny, moving and emotional. | Self-generated, interactive, distinctive imagery is recalled better (Bower, 1970; McDaniel & Einstein, 1986). |
| 8 | **ESV text** | Verse text comes from `verses.json` (ESV, used with the owner's permission). The translation is fixed per book. | Verbatim recall needs one stable source text. |
| 9 | **Walk it back, and review** | After placing a room, the learner closes their eyes, walks the route and recites. They review the next day and again a week later. | Retrieval practice (Roediger & Karpicke, 2006) and spaced review (Cepeda et al., 2006). Method-of-loci training produces durable gains (Dresler et al., 2017). |

Virtual palaces work: building the palace in a virtual environment gives the same benefit as a real one (Legge et al., 2012). A meta-analysis supports the method of loci overall (Twomey & Kroneisen, 2021).

## References
- Bower, G. H. (1970). Analysis of a mnemonic device. *American Scientist*, 58, 496–510.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354–380.
- Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences*, 24, 87–114.
- Dresler, M., et al. (2017). Mnemonic training reshapes brain networks to support superior memory. *Neuron*, 93(5), 1227–1235. https://pmc.ncbi.nlm.nih.gov/articles/PMC5439266
- Legge, E. L. G., Madan, C. R., Ng, E. T., & Caplan, J. B. (2012). Building a memory palace in minds: Equivalent benefits of the method of loci in virtual and real environments. *Acta Psychologica*, 141, 380–390. https://www.psych.ualberta.ca/~cml/papers/LeggEtal2012.pdf
- McDaniel, M. A., & Einstein, G. O. (1986). Bizarre imagery as an effective memory aid: The importance of distinctiveness. *JEP: Learning, Memory, and Cognition*, 12(1), 54–65.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3), 249–255. https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf
- Twomey, C., & Kroneisen, M. (2021). The effectiveness of the loci method as a mnemonic device: Meta-analysis. *Quarterly Journal of Experimental Psychology*, 74(8), 1317–1326.
- Yates, F. A. (1966). *The Art of Memory*. Routledge & Kegan Paul.
