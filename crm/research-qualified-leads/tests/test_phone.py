from __future__ import annotations

import unittest

from helpers import ROOT
from parse_phone import parse_phone


class PhoneTests(unittest.TestCase):
    def test_german_phone_mapping(self):
        result = parse_phone("+49 211 87574712", "DE")
        self.assertEqual(result["number"], "21187574712")
        self.assertEqual(result["country_code"], "DE")
        self.assertEqual(result["calling_code"], "+49")

    def test_country_mismatch_rejected(self):
        with self.assertRaises(ValueError):
            parse_phone("+43 1 2345678", "DE")


if __name__ == "__main__":
    unittest.main()
