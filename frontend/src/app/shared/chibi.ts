import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Appearance } from '../domain/models';

/** Deliberately simple SVG placeholder. Layer groups reserve the future asset slots. */
@Component({
  selector: 'app-chibi',
  template: `
    <svg
      viewBox="0 0 240 290"
      role="img"
      aria-label="Chibi-Platzhalter: kleiner Wanderer mit Umhang"
    >
      <ellipse cx="120" cy="262" rx="60" ry="10" fill="#081813" opacity=".35" />
      <g data-slot="back">
        <path d="M88 151 Q58 185 67 246 Q117 263 169 246 Q170 183 151 151Z" fill="#35584e" />
        <path d="M79 201 69 242 93 233M159 204 169 243 146 235" fill="#27473f" />
      </g>
      <g data-slot="body">
        <path d="M98 219 95 250 114 253 119 221M126 220 128 252 147 251 143 215" fill="#263c37" />
        <path
          d="M94 246 Q83 256 93 260L114 260 114 246M128 246 129 260 152 260Q156 251 143 246"
          fill="#786149"
        />
        <path
          d="M92 153 Q119 142 146 155 L153 217 Q121 233 86 217Z"
          [attr.fill]="appearance().outfitColor"
        />
        <path
          d="M91 160 Q71 171 75 201L90 205 104 172M145 159Q166 167 164 199L150 205 137 175"
          [attr.fill]="appearance().outfitColor"
        />
        <ellipse cx="82" cy="204" rx="10" ry="11" [attr.fill]="appearance().skinColor" />
        <ellipse cx="156" cy="204" rx="10" ry="11" [attr.fill]="appearance().skinColor" />
        <path d="M90 204 149 204 150 215 88 215Z" fill="#5e4e3e" />
        <rect x="115" y="204" width="14" height="11" rx="2" fill="#c8b37b" />
        <path d="M94 151 119 170 145 151 151 168 120 184 87 166Z" fill="#aac3a3" />
        <path d="M120 180 132 192 119 202 108 192Z" fill="#dbcb98" />
      </g>
      <g data-slot="face">
        <ellipse cx="76" cy="113" rx="11" ry="15" [attr.fill]="appearance().skinColor" />
        <ellipse cx="164" cy="113" rx="11" ry="15" [attr.fill]="appearance().skinColor" />
        <path
          d="M75 93Q72 47 119 47Q169 47 166 96L163 123Q153 153 120 155Q87 154 77 127Z"
          [attr.fill]="appearance().skinColor"
        />
        <ellipse cx="99" cy="114" rx="5.5" ry="8" fill="#263c35" />
        <ellipse cx="143" cy="114" rx="5.5" ry="8" fill="#263c35" />
        <circle cx="101" cy="111" r="2" fill="#fff5d9" />
        <circle cx="145" cy="111" r="2" fill="#fff5d9" />
        <path
          d="M116 134Q122 138 128 133"
          fill="none"
          stroke="#986c55"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <ellipse cx="90" cy="130" rx="8" ry="3" fill="#d78f7e" opacity=".4" />
        <ellipse cx="151" cy="130" rx="8" ry="3" fill="#d78f7e" opacity=".4" />
      </g>
      <g data-slot="hair" [attr.fill]="appearance().hairColor">
        <path
          d="M73 106Q58 65 82 49L76 40 97 44Q126 24 155 48L170 41 166 60Q186 83 165 109L157 81 145 96 131 71 108 97 108 77 83 104 84 80Z"
        />
      </g>
      <g data-slot="accessory" fill="none" stroke="#bdcba1" stroke-width="3" stroke-linecap="round">
        <path d="M155 77 172 59M160 70Q151 57 160 50M164 65Q180 68 182 57" />
      </g>
    </svg>
  `,
  styles: ['svg { display: block; width: 100%; height: 100%; overflow: visible; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chibi {
  readonly appearance = input.required<Appearance>();
}
