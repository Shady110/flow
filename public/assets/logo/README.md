# FLOW brand assets

`components/ui/Logo.tsx` reads exactly these filenames. Save the supplied
artwork here with these names — SVG is preferred over PNG (swap the extension
in `Logo.tsx` if you use SVG; nothing else needs to change).

| File | Artwork |
| --- | --- |
| `flow-mark-green.png`     | the F mark, dark green |
| `flow-mark-white.png`     | the F mark, white — for dark grounds |
| `flow-wordmark-green.png` | "FLOW" wordmark, dark green |
| `flow-wordmark-white.png` | "FLOW" wordmark, white |
| `flow-lockup-green.png`   | mark + rule + wordmark, dark green |
| `flow-lockup-white.png`   | mark + rule + wordmark, white |

Export tight to the glyph — no baked-in padding. The component sets width from
a measured aspect ratio (mark 1:1, wordmark 2.72:1, lockup 4.03:1), so extra
canvas around the artwork makes the logo render smaller than its neighbours at
the same height class. If your exports have different proportions, update
`RATIO` in `Logo.tsx` to match.

There is no green cut of the white files and vice versa: `tone="dark"` means
dark ink for light backgrounds, `tone="light"` means white ink for dark ones.
