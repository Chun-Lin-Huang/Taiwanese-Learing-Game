#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import unicodedata

class RomanizationConverter:
    def __init__(self):
        # 聲調映射表（組合符號）
        self.tone_map = {
            '\u0301': '2',  # ˊ
            '\u0300': '3',  # ˋ
            '\u0302': '5',  # ˆ
            '\u0304': '7',  # ˉ
            '\u030d': '8',  # ̍
            '\u030b': '9',  # ̋
            '\u030c': '6',  # ˇ（可選，部分教材用）
        }
        # 直接對應完整字（單字鼻音用）
        self.full_char_map = {
            'á': ('a', '2'), 'à': ('a', '3'), 'â': ('a', '5'), 'ǎ': ('a', '6'), 'ā': ('a', '7'), 'a̍': ('a', '8'), 'a̋': ('a', '9'),
            'é': ('e', '2'), 'è': ('e', '3'), 'ê': ('e', '5'), 'ě': ('e', '6'), 'ē': ('e', '7'), 'e̍': ('e', '8'), 'e̋': ('e', '9'),
            'í': ('i', '2'), 'ì': ('i', '3'), 'î': ('i', '5'), 'ǐ': ('i', '6'), 'ī': ('i', '7'), 'i̍': ('i', '8'), 'i̋': ('i', '9'),
            'ó': ('o', '2'), 'ò': ('o', '3'), 'ô': ('o', '5'), 'ǒ': ('o', '6'), 'ō': ('o', '7'), 'o̍': ('o', '8'), 'ő': ('o', '9'),
            'ú': ('u', '2'), 'ù': ('u', '3'), 'û': ('u', '5'), 'ǔ': ('u', '6'), 'ū': ('u', '7'), 'u̍': ('u', '8'), 'ű': ('u', '9'),
            'ḿ': ('m', '2'), 'm̀': ('m', '3'), 'm̂': ('m', '5'), 'm̌': ('m', '6'), 'm̄': ('m', '7'), 'm̍': ('m', '8'), 'm̋': ('m', '9'),
            'ńg': ('ng', '2'), 'ǹg': ('ng', '3'), 'n̂g': ('ng', '5'), 'ňg': ('ng', '6'), 'n̄g': ('ng', '7'), 'n̍g': ('ng', '8'), 'n̋g': ('ng', '9'),
        }
        self.o_dot_char = '\u0358'  # o͘

    def convert_to_numeric_tone(self, text):
        text = self._preprocess_punctuation(text)
        syllables = re.split(r'(\s+|[-])', text)
        converted = [self._convert_syllable(s) for s in syllables]
        return ''.join(converted)

    def convert_to_numeric_tone_with_sandhi(self, text, apply_sandhi=True, variant='chang'):
        """
        先轉數字調（本調），再對非句尾音節套用連讀變調規則。
        variant: 'chang'（漳腔 5→7）或 'chuan'（泉腔 5→3）
        """
        text = self._preprocess_punctuation(text)
        tokens = re.split(r'(\s+|[-])', text)
        # 先本調轉換
        converted_tokens = [self._convert_syllable(tok) for tok in tokens]

        if not apply_sandhi:
            return ''.join(converted_tokens)

        # 找出所有是音節的索引（最後一個不變調）
        syllable_indexes = [i for i, tok in enumerate(converted_tokens) if self._is_numeric_syllable(tok)]
        if len(syllable_indexes) <= 1:
            return ''.join(converted_tokens)

        last_idx = syllable_indexes[-1]
        for idx in syllable_indexes:
            if idx == last_idx:
                continue  # 句尾保留本調
            base, tone = self._split_numeric_syllable(converted_tokens[idx])
            new_tone = self._apply_sandhi_tone(base, tone, variant)
            converted_tokens[idx] = f"{base}{new_tone}"

        return ''.join(converted_tokens)

    def _preprocess_punctuation(self, text):
        """
        標點轉換：句號換兩個空格，逗號換一個空格
        """
        text = unicodedata.normalize('NFC', text)
        text = re.sub(r'[。\.!?！？]', '  ', text)  # 長停頓
        text = re.sub(r'[，,]', ' ', text)          # 短停頓
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _convert_syllable(self, syllable):
        if not syllable or syllable.isspace() or syllable == '-' or re.search(r'\d$', syllable):
            return syllable

        # 輕聲
        if syllable.startswith('--'):
            return syllable[2:] + '0'

        # 直接處理特殊鼻音
        for full, (base, tone) in self.full_char_map.items():
            if syllable == full:
                return base + tone

        # NFD拆分
        decomposed = unicodedata.normalize('NFD', syllable)
        base_chars = []
        tone_number = None

        for char in decomposed:
            if unicodedata.combining(char):
                if char in self.tone_map and not tone_number:
                    tone_number = self.tone_map[char]
                else:
                    base_chars.append(char)  # 保留o͘的點
            else:
                base_chars.append(char)

        # o͘ 處理
        base_syllable = ''.join(base_chars).replace(f'o{self.o_dot_char}', 'oo')

        # 預設聲調判斷
        if not tone_number:
            if base_syllable.lower().endswith(('p', 't', 'k', 'h')):
                tone_number = '4'
            elif any(c in 'aeioumn' for c in base_syllable.lower()):
                tone_number = '1'
            else:
                tone_number = '1'  # 保底

        return base_syllable + tone_number

    # ===== Sandhi helpers =====
    def _is_numeric_syllable(self, token: str) -> bool:
        return bool(re.fullmatch(r"[A-Za-z\-]+\d", token))

    def _split_numeric_syllable(self, token: str):
        m = re.fullmatch(r"([A-Za-z\-]+)(\d)", token)
        if not m:
            return token, '1'
        return m.group(1), m.group(2)

    def _apply_sandhi_tone(self, base: str, tone: str, variant: str) -> str:
        b = base.lower()
        if tone == '1':
            return '7'
        if tone == '2':
            return '1'
        if tone == '3':
            return '2'
        if tone == '5':
            return '7' if variant == 'chang' else '3'
        if tone == '7':
            return '3'
        if tone == '4':
            if b.endswith(('p', 't', 'k')):
                return '8'
            if b.endswith('h'):
                return '2'
        if tone == '8':
            if b.endswith(('p', 't', 'k')):
                return '4'
            if b.endswith('h'):
                return '3'
        return tone

    def test(self):
        test_cases = [
            "guá sī Tâi-oân-lâng。",
            "lí hó，chhiáⁿ lâi!",
            "tsia̍h-pn̄g",
            "kám-siā",
            "o͘-á-kah。",
            "goe̍h-niû。",
            "thak-tsheh",
            "sió-bōo",
            "ńg",
            "m̄",
            "--lah",
            "tsit-ê --lâng chin-kán-tan。",
            "Tâi-lô",
            "a̋ e̋",  # 測試第9聲
        ]
        for t in test_cases:
            print(f"輸入: {t}")
            print(f"輸出: {self.convert_to_numeric_tone(t)}")
            print("-" * 30)

if __name__ == "__main__":
    converter = RomanizationConverter()
    converter.test()
