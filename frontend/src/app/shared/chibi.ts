import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CHARACTER_OPTIONS } from '../domain/character';
import { Appearance } from '../domain/models';

/** Original SVG placeholder art. Every creator slot is a separate, replaceable layer. */
@Component({
  selector: 'app-chibi',
  template: `
    <svg viewBox="0 0 240 290" role="img" [attr.aria-label]="description()">
      <g data-slot="aura" [attr.data-variant]="appearance().aura" fill="none">
        @switch (appearance().aura) {
          @case ('sage') {
            <ellipse cx="120" cy="153" rx="99" ry="114" stroke="#a7c889" stroke-opacity=".27" />
            <ellipse cx="120" cy="155" rx="108" ry="122" stroke="#a7c889" stroke-opacity=".12" stroke-dasharray="3 12" />
            <path d="M28 118q-14-8-5-17q12 2 5 17M210 197q15-4 10-15q-12-1-10 15M42 233q-12 3-12-10q12-4 12 10" fill="#bed998" />
            <circle cx="191" cy="58" r="3" fill="#d1e4b7" />
          }
          @case ('rose') {
            <ellipse cx="120" cy="153" rx="104" ry="117" stroke="#eab0cd" stroke-opacity=".25" />
            <g fill="#edb4d0">
              <path d="M29 95c-12-11-19 6 0 14c19-8 12-25 0-14M207 182c-12-11-19 6 0 14c19-8 12-25 0-14" />
              <path d="m194 57 3-9 3 9 9 3-9 3-3 9-3-9-9-3zM34 227l3-9 3 9 9 3-9 3-3 9-3-9-9-3z" />
            </g>
          }
          @case ('void') {
            <ellipse cx="120" cy="156" rx="105" ry="117" stroke="#b395ea" stroke-width="3" stroke-opacity=".25" />
            <path d="M29 69 15 105 31 103 20 137M208 201l15-30-15 3 14-34M188 39l-8 19 11-4" stroke="#c4a6ff" stroke-width="3" stroke-linejoin="round" />
            <path d="m40 205 6 9-6 10-6-10zM199 81l5 8-5 8-5-8z" fill="#c4a6ff" />
          }
        }
      </g>
      <ellipse cx="120" cy="263" rx="60" ry="9" fill="#081813" opacity=".35" />
      <g data-slot="back" [attr.data-variant]="outfit()">
        @switch (outfit()) {
          @case ('cozy') {
            <path d="M84 153Q64 155 67 195L84 203M156 153Q176 155 173 195L156 203" fill="#a69783" />
          }
          @case ('abyssal') {
            <path d="M99 173Q65 92 20 97L37 129 24 160 46 152 49 189 70 173 82 206ZM141 173Q175 92 220 97L203 129 216 160 194 152 191 189 170 173 158 206Z" fill="#333043" stroke="#9881b6" stroke-width="2" />
            <path d="M90 176 42 122M150 176l48-54M77 166l-22-5M163 166l22-5" stroke="#826797" stroke-width="2" />
          }
          @case ('elegant') {
            <path d="M88 151Q54 193 53 245L91 254 120 226 150 254 189 245Q185 186 151 151Z" fill="#798796" opacity=".8" />
            <path d="M65 236 84 170M175 236l-19-66" stroke="#e0caa4" stroke-width="2" />
          }
          @case ('dark') {
            <path d="M88 149Q66 191 60 252L92 245 117 259 148 245 180 252Q172 184 150 149Z" fill="#353540" />
            <path d="M74 244 89 171M165 244l-16-73" stroke="#8e7a96" />
          }
          @default {
            <path d="M88 151Q58 185 67 246Q117 263 169 246Q170 183 151 151Z" fill="#35584e" />
            <path d="M79 201 69 242 93 233M159 204 169 243 146 235" fill="#27473f" />
          }
        }
      </g>
      <g data-slot="body" [attr.data-variant]="appearance().body" [attr.transform]="bodyTransform()">
        <path d="M98 219 95 250 114 253 119 221M126 220 128 252 147 251 143 215" fill="#263c37" />
        <path d="M94 246Q83 256 93 260L114 260 114 246M128 246 129 260 152 260Q156 251 143 246" fill="#786149" />
        <g data-slot="outfit" [attr.data-variant]="outfit()">
          <path d="M92 153Q119 142 146 155L153 217Q121 233 86 217Z" [attr.fill]="appearance().outfitColor" />
          <path d="M91 160Q71 171 75 201L90 205 104 172M145 159Q166 167 164 199L150 205 137 175" [attr.fill]="appearance().outfitColor" />
          @switch (outfit()) {
            @case ('cozy') {
              <path d="M92 151Q70 163 93 180L119 169 145 181Q168 165 146 151L121 164Z" fill="#efded0" />
              <path d="M104 196 98 213 142 213 136 196Z" fill="#fff5e7" opacity=".3" />
              <path d="M110 169v18M130 169v18" stroke="#f5e4d6" stroke-width="3" stroke-linecap="round" />
              <path d="M78 195 91 198M150 198l13-3" stroke="#f5e4d6" stroke-width="8" />
            }
            @case ('elegant') {
              <path d="M92 185 79 244Q120 258 162 244L145 185Z" [attr.fill]="appearance().outfitColor" />
              <path d="M98 151 120 188 140 151M120 188v58M83 238q36 13 75 0" fill="none" stroke="#e1ca9a" stroke-width="3" />
              <path d="m120 176 7 10-7 11-7-11z" fill="#dedbe8" />
            }
            @case ('dark') {
              <path d="M90 150 71 166 79 183 96 171 119 184 145 171 161 183 170 165 149 150 121 169Z" fill="#383643" stroke="#a299ac" stroke-width="2" />
              <path d="M99 181 120 194 142 181 142 211 121 229 97 213Z" fill="#242a32" opacity=".65" />
              <path d="M101 186 121 199 139 187M121 199v24" stroke="#a9a0b9" stroke-width="2" />
              <path d="m121 187 5 8-5 8-5-8z" fill="#baa3d8" />
            }
            @case ('abyssal') {
              <path d="M93 150 77 144 63 169 82 165 75 186 102 174 120 187 140 174 165 186 159 165 177 169 163 144 146 150 120 163Z" fill="#302c3b" stroke="#b598d0" stroke-width="2" />
              <path d="M102 182 120 197 139 182 146 219 120 234 94 217Z" fill="#252730" opacity=".7" />
              <path d="m120 181 9 16-9 18-9-18z" fill="#c4a5f0" />
              <path d="m98 218 20 13M143 218l-20 13" stroke="#b598d0" stroke-width="2" />
            }
            @default {
              <path d="M90 204 149 204 150 215 88 215Z" fill="#5e4e3e" />
              <rect x="115" y="204" width="14" height="11" rx="2" fill="#c8b37b" />
              <path d="M94 151 119 170 145 151 151 168 120 184 87 166Z" fill="#aac3a3" />
              <path d="M120 180 132 192 119 202 108 192Z" fill="#dbcb98" />
            }
          }
        </g>
        <ellipse cx="82" cy="204" rx="10" ry="11" [attr.fill]="appearance().skinColor" />
        <ellipse cx="156" cy="204" rx="10" ry="11" [attr.fill]="appearance().skinColor" />
      </g>
      <g data-slot="hair-back" [attr.fill]="appearance().hairColor">
        @if (appearance().hair === 'bob') {
          <path d="M75 69Q119 33 167 68L178 156Q162 166 148 154L91 155Q71 165 62 155Z" />
        }
        @if (appearance().hair === 'braid') {
          <path d="M154 118Q192 125 170 149Q191 159 169 177Q186 192 165 207L155 218 151 200Q141 182 156 171Q143 155 158 145L145 127Z" />
          <path d="M166 147 157 161M168 177l-12 12" stroke="#fff8e8" stroke-opacity=".2" stroke-width="3" />
          <path d="m152 204 11 2" stroke="#d8c19b" stroke-width="6" />
        }
      </g>
      <g data-slot="face">
        <ellipse cx="76" cy="113" rx="11" ry="15" [attr.fill]="appearance().skinColor" />
        <ellipse cx="164" cy="113" rx="11" ry="15" [attr.fill]="appearance().skinColor" />
        <path d="M75 93Q72 47 119 47Q169 47 166 96L163 123Q153 153 120 155Q87 154 77 127Z" [attr.fill]="appearance().skinColor" />
        <ellipse cx="99" cy="114" rx="5.5" ry="8" fill="#263c35" />
        <ellipse cx="143" cy="114" rx="5.5" ry="8" fill="#263c35" />
        <circle cx="101" cy="111" r="2" fill="#fff5d9" />
        <circle cx="145" cy="111" r="2" fill="#fff5d9" />
        <path d="M116 134Q122 138 128 133" fill="none" stroke="#986c55" stroke-width="2.5" stroke-linecap="round" />
        <ellipse cx="90" cy="130" rx="8" ry="3" fill="#d78f7e" opacity=".4" />
        <ellipse cx="151" cy="130" rx="8" ry="3" fill="#d78f7e" opacity=".4" />
      </g>
      <g data-slot="hair" [attr.data-variant]="appearance().hair" [attr.fill]="appearance().hairColor">
        @switch (appearance().hair) {
          @case ('bob') {
            <path d="M69 113 68 81Q70 39 119 39Q168 40 173 83L169 119 156 96 148 74 139 92 116 77 106 94 88 83 84 114Z" />
          }
          @case ('braid') {
            <path d="M74 108Q56 67 85 47Q122 23 154 48Q180 64 166 107L155 82 140 64Q111 91 80 90Z" />
            <path d="M143 56Q129 70 102 77" stroke="#fff8e8" stroke-opacity=".18" stroke-width="3" fill="none" />
          }
          @default {
            <path d="M73 106Q58 65 82 49L76 40 97 44Q126 24 155 48L170 41 166 60Q186 83 165 109L157 81 145 96 131 71 108 97 108 77 83 104 84 80Z" />
          }
        }
      </g>
      <g data-slot="accessory">
        @switch (outfit()) {
          @case ('cozy') {
            <path d="m80 57-5-31q25-1 29 22M140 48q4-24 29-22l-5 31" [attr.fill]="appearance().outfitColor" />
            <path d="m82 48-1-14 14 10M147 44l14-10-1 14" fill="#edbdc4" />
          }
          @case ('elegant') {
            <path d="M79 71 102 75 120 63 139 75 160 71" fill="none" stroke="#dcc38e" stroke-width="3" />
            <path d="m120 58 6 8-6 9-6-9z" fill="#ddd7f0" />
          }
          @case ('dark') {
            <path d="M85 59Q66 44 76 22L93 47M148 47l17-25q10 22-9 37" fill="#4d465a" stroke="#aa9ebc" stroke-width="2" />
          }
          @case ('abyssal') {
            <path d="M85 59Q51 41 70 12Q64 36 98 45M142 45q34-9 28-33 19 29-15 47" fill="#3b324d" stroke="#bd9edd" stroke-width="2" />
            <path d="M100 58 104 43 119 54 133 43 139 58 120 65Z" fill="#9b7abe" />
          }
          @default {
            <path d="M155 77 172 59M160 70Q151 57 160 50M164 65Q180 68 182 57" fill="none" stroke="#bdcba1" stroke-width="3" stroke-linecap="round" />
          }
        }
      </g>
    </svg>
  `,
  styles: ['svg { display: block; width: 100%; height: 100%; overflow: visible; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chibi {
  readonly appearance = input.required<Appearance>();
  readonly outfit = computed(() => this.appearance().outfit === 'wanderer' ? 'adventurer' : this.appearance().outfit);
  readonly bodyTransform = computed(() => {
    switch (this.appearance().body) {
      case 'compact': return 'translate(120 153) scale(.91 .96) translate(-120 -153)';
      case 'broad': return 'translate(120 260) scale(1.16 1) translate(-120 -260)';
      default: return '';
    }
  });
  readonly description = computed(() => {
    const style = CHARACTER_OPTIONS.outfit.find((option) => option.id === this.outfit())?.label ?? 'Adventurer';
    const hair = CHARACTER_OPTIONS.hair.find((option) => option.id === this.appearance().hair)?.label ?? 'Strubbelig';
    return 'Dein Chibi: ' + style + ', Frisur ' + hair + '. Vorläufige Illustration.';
  });
}
