/** Original outfit sets. Each part has a fixed body anchor and a deliberate material role. */
export type OutfitMaterial = 'none' | 'color' | 'skin' | 'cloth' | 'shade' | 'light' | 'lining' | 'leather' | 'leatherLight' | 'sole' | 'metal' | 'gold' | 'plate' | 'plateShade' | 'plateDeep' | 'edge';
export interface OutfitPart {
  d: string;
  fill: OutfitMaterial;
  stroke?: OutfitMaterial;
  width?: number;
  opacity?: number;
  layer?: string;
}
export interface ChibiOutfitSet {
  back: OutfitPart[];
  legs: OutfitPart[];
  torso: OutfitPart[];
  farArm: OutfitPart[];
  nearArm: OutfitPart[];
  headpiece: OutfitPart[];
}
const p = (d: string, fill: OutfitMaterial, stroke?: OutfitMaterial, width = 1.4, layer?: string): OutfitPart => ({ d, fill, stroke, width, layer });

export function resolveChibiOutfit(style: string, female: boolean): ChibiOutfitSet {
  const torso = female
    ? 'M101 154Q119 147 140 156L143 178 136 194 144 224Q122 232 96 224L103 195 97 177Z'
    : 'M94 154Q120 143 148 156L153 183 151 225Q122 233 89 225L89 181Z';
  const base = p(torso, 'color', undefined, 1.4, 'torso-base');
  const boots = [
    p('M126 218 130 246 147 245 145 217Z', 'lining'),
    p('M97 218 93 247 111 251 119 218Z', 'shade'),
    p('M130 236 130 252 151 253 160 250 157 245 145 241 143 235Z', 'leather', 'sole'),
    p('M94 234 90 250 80 255 82 261 116 261 116 239Z', 'leather', 'sole'),
    p('M82 256 115 256 116 261 82 261ZM131 249 156 249 159 252 130 255Z', 'sole'),
    p('M97 240 108 242M94 246l12 2M134 239l8 1', 'none', 'leatherLight', 2),
  ];
  if (style === 'cozy') return {
    back: [],
    legs: [
      p('M98 211 91 243 110 247 121 218 129 243 145 242 146 210Z', 'lining'),
      p('M104 221 99 239M135 220l3 18', 'none', 'shade', 2.5),
      p('M93 235 89 250 80 254 81 260 114 260 115 240Z', 'cloth', 'lining'),
      p('M130 235 130 250 154 251 158 247 146 240 145 234Z', 'shade', 'lining'),
      p('M80 255 114 255 115 261 80 261ZM130 247 157 247 157 253 130 253Z', 'metal'),
      p('M97 243 108 245M95 249l12 1M135 240l8 2', 'none', 'light', 2.2),
      p('M91 249 91 240 94 238M135 236l7 1', 'none', 'light', 1.5),
    ],
    torso: [base,
      p(female ? 'M100 154Q121 145 142 156L149 187 143 225Q119 233 92 223L93 183Z' : 'M92 153Q119 141 149 155L157 189 153 224Q119 235 85 224L85 184Z', 'cloth', 'lining', 1.5),
      p('M137 164 148 174 151 211 140 224 128 226 137 208Z', 'shade'),
      p('M91 216Q121 223 150 215L150 227Q119 235 89 226Z', 'shade', 'lining', 1),
      p('M98 198 107 190 132 191 141 199 138 212 101 212Z', 'shade', 'light', 1.2),
      p('M101 198 108 194M132 195l6 5', 'none', 'lining', 2),
      p('M99 153Q87 157 91 169L106 180 123 175 141 181 151 167 145 153 127 162Z', 'shade', 'lining', 1.5),
      p('M100 155 112 165 126 168 139 164 145 157', 'none', 'light', 3),
      p('M115 170 113 188M135 170l2 17', 'none', 'metal', 2.2),
      p('M111 185 115 185 115 192 111 192ZM135 184h4v7h-4Z', 'metal'),
      p('M95 179 91 207M147 184l1 20', 'none', 'light', 1.2),
    ],
    farArm: [p('M145 156Q166 162 170 182L166 205 150 206 141 175Z', 'shade', 'lining'), p('M150 197 167 197 166 207 151 208Z', 'lining'), p('M153 207 165 207 166 218 155 221 150 215Z', 'skin')],
    nearArm: [p('M96 157Q80 159 72 174L69 197 83 209 97 195 109 172Z', 'cloth', 'lining', 1.5), p('M81 170 77 192 83 199', 'none', 'light', 2.5), p('M70 194 88 200 84 211 68 204Z', 'shade', 'lining'), p('M72 204 84 207 86 217 76 223 67 216Z', 'skin')],
    headpiece: [],
  };
  if (style === 'elegant') return {
    back: [p('M95 153 81 191 69 249 91 256 115 214 144 251 169 247 156 187 144 152Z', 'lining', 'shade'), p('M85 190 75 244M156 190l7 49', 'none', 'gold', 1.5)],
    legs: boots.map((part) => part.fill === 'leather' ? { ...part, fill: 'lining' } : part),
    torso: [base,
      p(female ? 'M101 153 139 155 140 178 133 193 148 240 123 252 114 214 102 246 82 240 104 190 96 173Z' : 'M93 153 146 155 148 179 142 196 156 240 128 252 119 214 105 249 82 240 97 192 89 174Z', 'cloth', 'lining', 1.5),
      p('M126 164 137 173 132 193 143 238 127 246 119 208Z', 'shade'),
      p('M107 150 121 174 137 150 142 162 126 185 120 188 102 162Z', 'lining', 'gold', 1.5),
      p('M119 184 126 185 124 206 117 206Z', 'gold'),
      p('M98 193 138 194 141 202 96 201Z', 'lining', 'gold', 1),
      p('M119 192 129 197 122 205 113 199Z', 'metal', 'gold', 1),
      p('M96 208 87 235 103 239M136 209l13 26-19 8', 'none', 'gold', 1.5),
      p('M111 210 106 233M137 212l5 17', 'none', 'light', 1.7),
    ],
    farArm: [p('M142 155 164 162 166 188 159 217 146 213 147 185 135 172Z', 'shade', 'lining'), p('M147 204 162 208 159 220 146 215Z', 'lining', 'gold', 1.2)],
    nearArm: [p('M98 154 79 163 72 185 77 220 93 216 90 187 106 172Z', 'cloth', 'lining', 1.5), p('M82 170 78 187 83 211', 'none', 'light', 2), p('M76 207 94 205 96 220 78 224Z', 'lining', 'gold', 1.2)],
    headpiece: [p('M85 73 105 71 123 61 144 69 161 69', 'none', 'gold', 2), p('M123 57 128 64 123 72 118 64Z', 'light', 'gold', 1)],
  };
  if (style === 'dark') return {
    back: [p('M95 151 78 177 73 215 62 250 89 247 108 258 120 236 143 255 170 250 164 204 149 150Z', 'lining', 'plateDeep'), p('M88 170 80 235M154 172l8 63', 'none', 'shade', 2)],
    legs: [
      p('M96 211 91 245 112 247 121 219 127 245 146 245 146 213Z', 'plateDeep'),
      p('M96 227 113 228 109 250 89 251Z', 'plate', 'plateDeep'),
      p('M127 226 144 225 148 246 128 249Z', 'plateShade', 'plateDeep'),
      p('M97 230 105 233 102 244 93 246ZM131 230l9-1 4 13-10 2Z', 'shade'),
      p('M90 246 111 245 117 252 117 262 79 262 76 257Z', 'plate', 'plateDeep', 1.7),
      p('M129 245 146 243 161 251 160 257 128 257Z', 'plateShade', 'plateDeep', 1.7),
      p('M81 255 110 253M131 250l19 2M93 228l17 1', 'none', 'edge', 1.7),
    ],
    torso: [base,
      p('M104 154 141 154 147 211 134 233 102 230 91 210Z', 'plateDeep'),
      p(female ? 'M103 156 138 156 143 173 136 190 119 196 102 187 96 171Z' : 'M94 155 146 155 153 173 142 190 120 198 96 190 87 170Z', 'plate', 'plateDeep', 1.8),
      p('M125 161 144 162 145 174 135 188 122 193Z', 'plateShade'),
      p('M98 159 112 156 121 164 136 157 145 161', 'none', 'edge', 2),
      p('M114 163 126 166 124 179 116 182 110 173Z', 'color', 'edge', 1),
      p('M101 190 120 199 139 188 138 201 119 210 102 202Z', 'plateShade', 'edge', 1),
      p('M101 200 120 209 139 199 140 210 121 217 99 210Z', 'plate', 'plateDeep'),
      p('M97 209 141 208 144 216 95 217Z', 'leather', 'plateDeep'),
      p('M116 208 127 209 128 217 115 217Z', 'metal'),
      p('M96 216 114 219 109 236 90 232ZM129 219l15-3 6 16-18 5Z', 'plate', 'plateDeep', 1.4),
      p('M96 220 109 223M134 223l8-3', 'none', 'edge', 1.5),
    ],
    farArm: [p('M144 159 163 162 170 181 160 193 145 183Z', 'plateShade', 'plateDeep', 1.6), p('M149 154 166 158 175 171 163 181 145 173Z', 'plate', 'plateDeep', 1.7), p('M150 158 164 162 169 169', 'none', 'edge', 1.5), p('M150 184 166 185 166 207 150 211Z', 'plateShade', 'plateDeep'), p('M152 209 166 208 171 219 166 225 153 222Z', 'plateDeep', 'edge', 1)],
    nearArm: [p('M97 158 81 164 72 190 82 204 98 188 106 173Z', 'plateShade', 'plateDeep'), p('M97 151 78 155 67 171 75 184 96 178 107 166Z', 'plate', 'plateDeep', 1.8), p('M77 162 91 157 102 166', 'none', 'edge', 2), p('M77 164 90 161 98 168 84 173Z', 'color'), p('M73 187 91 193 86 215 69 210Z', 'plate', 'plateDeep', 1.6), p('M77 192 86 196 81 208 74 205Z', 'plateShade'), p('M71 211 86 215 86 225 75 230 66 222Z', 'plateDeep', 'edge', 1)],
    headpiece: [],
  };
  if (style === 'abyssal') return {
    back: [
      p('M101 180 81 157 71 126 49 111 26 64 28 108 42 145 24 127 42 173 65 184 72 211 98 224Z', 'plateDeep', 'edge', 1.5),
      p('M80 155 61 137 41 100 49 136 65 162 85 183Z', 'plate', 'plateShade'),
      p('M65 173 52 160 65 189 79 201 85 218 94 218Z', 'plateShade', 'edge', 1),
      p('M78 149 62 126 47 108M55 173l20 13', 'none', 'color', 2),
      p('M143 173 161 153 170 132 189 118 210 86 202 124 191 146 210 134 196 172 174 184 167 210 145 220Z', 'plateDeep', 'edge', 1.2),
      p('M159 173 178 151 198 110 186 151 171 173 155 190Z', 'plateShade'),
      p('M170 161 185 140M174 181l17-14', 'none', 'color', 1.6),
      p('M90 182 79 215 68 252 90 244 103 261 121 237 142 260 154 244 176 253 163 217 151 181Z', 'lining', 'plateDeep'),
    ],
    legs: [
      p('M96 212 91 248 112 249 121 220 128 246 149 246 146 211Z', 'plateDeep'),
      p('M96 225 115 224 112 241 104 251 86 254 91 239Z', 'plate', 'plateDeep', 1.6),
      p('M127 224 145 223 151 247 131 251Z', 'plateShade', 'plateDeep', 1.6),
      p('M93 232 103 236 99 246 90 249ZM134 228l7 1 4 13-8 3Z', 'color'),
      p('M89 246 108 244 116 251 118 263 89 265 71 262 78 254Z', 'plate', 'plateDeep', 1.8),
      p('M129 245 147 242 165 250 168 258 151 262 126 259Z', 'plateShade', 'plateDeep', 1.8),
      p('M80 256 106 252 112 256M133 250l17 2 9 5', 'none', 'edge', 1.7),
    ],
    torso: [base,
      p(female ? 'M102 153 141 154 145 173 136 192 141 211 124 226 97 217 100 193 94 173Z' : 'M92 152 148 153 156 173 144 197 147 212 123 229 91 219 88 174Z', 'plateDeep', 'edge', 1.5),
      p('M96 157 116 166 123 180 113 191 94 183 88 169Z', 'plate', 'plateDeep', 1.6),
      p('M131 161 147 156 154 173 143 188 127 184 122 174Z', 'plateShade', 'plateDeep', 1.6),
      p('M101 158 115 169M134 164l11-5 6 13', 'none', 'edge', 2),
      p('M119 164 128 168 132 181 124 194 115 187 112 175Z', 'color', 'edge', 1.3),
      p('M122 170 126 174 127 180 123 188 119 181Z', 'light'),
      p('M97 190 116 196 124 203 135 191 144 189 140 205 122 213 99 205Z', 'plate', 'plateDeep', 1.6),
      p('M101 207 122 215 140 205 144 215 124 224 97 216Z', 'plateShade', 'edge', 1),
      p('M94 218 113 222 107 243 87 232ZM129 224l17-7 8 18-21 9Z', 'plate', 'plateDeep', 1.6),
      p('M96 223 106 227 103 234M135 229l8-5', 'none', 'color', 1.6),
    ],
    farArm: [p('M143 157 162 160 174 179 164 193 146 182Z', 'plateShade', 'plateDeep'), p('M147 151 164 155 175 170 163 180 147 172Z', 'plate', 'edge', 1), p('M156 158 171 145 166 163Z', 'plateShade', 'edge', 1.1), p('M150 185 167 185 170 208 152 216Z', 'plateShade', 'plateDeep'), p('M155 209 169 207 177 218 169 229 155 226Z', 'plateDeep', 'edge', 1)],
    nearArm: [p('M97 156 78 165 69 189 80 204 99 190 108 173Z', 'plateShade', 'plateDeep'), p('M98 149 77 147 61 164 66 183 84 188 103 171Z', 'plate', 'plateDeep', 1.8), p('M79 151 68 134 68 160 74 165ZM96 153 95 136 87 156Z', 'plateShade', 'edge', 1.2), p('M76 161 89 155 98 166 85 177 72 172Z', 'plateShade', 'edge', 1), p('M78 164 88 159 93 166 85 171Z', 'color'), p('M70 188 91 195 88 215 76 222 66 211Z', 'plate', 'plateDeep', 1.8), p('M72 194 83 201 79 212 72 208Z', 'shade'), p('M69 216 84 220 90 231 79 239 66 230Z', 'plateDeep', 'edge', 1), p('M72 219 79 224 81 232', 'none', 'color', 1.5)],
    headpiece: [p('M88 60Q62 41 69 19L79 37 101 49ZM143 45l20-26q8 24-8 43Z', 'plateDeep', 'edge', 1.5), p('M86 50 78 39M155 46l6-14', 'none', 'color', 1.4)],
  };
  // The starter traveller wears an asymmetric field coat, leather harness and useful pockets.
  return {
    back: [p('M96 153 80 175 74 213 68 246 88 254 112 221 138 252 160 246 157 199 146 153Z', 'lining', 'shade'), p('M83 193 76 239M148 181l6 54', 'none', 'shade', 2)],
    legs: boots,
    torso: [base,
      p(female ? 'M100 153 140 155 141 180 134 196 149 231 132 241 119 213 103 236 84 230 104 193 96 175Z' : 'M93 152 146 155 149 182 144 198 156 229 137 242 119 216 102 241 81 229 96 191 87 173Z', 'cloth', 'lining', 1.5),
      p('M118 162 130 167 139 186 136 209 122 222 110 202 111 180Z', 'leather', 'lining'),
      p('M103 151 122 165 142 153 146 162 123 180 93 162Z', 'lining', 'shade', 1.4),
      p('M102 156 120 169M126 169l14-9', 'none', 'light', 2),
      p('M99 166 108 162 144 200 138 207Z', 'leather', 'leatherLight', 1),
      p('M125 187 132 184 138 191 131 195Z', 'metal', 'leather', 1),
      p('M93 203 143 199 147 210 91 215Z', 'leather', 'lining', 1.2),
      p('M116 203 128 202 130 211 116 213Z', 'metal', 'leather', 1),
      p('M93 209 107 211 108 228 91 227 87 216Z', 'leather', 'leatherLight', 1),
      p('M137 207 148 205 152 218 140 222Z', 'leather', 'leatherLight', 1),
      p('M92 214 105 215M141 211l6-1', 'none', 'metal', 1.4),
      p('M91 228 104 232M143 225l8 3', 'none', 'light', 1.6),
    ],
    farArm: [p('M143 155 160 162 167 184 160 204 145 199 142 176Z', 'shade', 'lining'), p('M146 192 162 196 160 211 146 207Z', 'leather', 'leatherLight', 1), p('M149 207 160 211 166 221 159 227 148 221Z', 'leather', 'lining')],
    nearArm: [p('M96 156 81 162 71 184 78 204 94 194 105 174Z', 'cloth', 'lining', 1.5), p('M85 168 78 183 83 194', 'none', 'light', 2.3), p('M73 190 91 196 86 213 70 207Z', 'leather', 'leatherLight', 1.2), p('M73 205 86 211 87 222 76 230 67 219Z', 'leather', 'lining', 1.2), p('M77 211l5 3', 'none', 'leatherLight', 1.4)],
    headpiece: [],
  };
}
