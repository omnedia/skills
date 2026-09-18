import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("align", Path(__file__).parents[1] / "scripts/align.py")
align = importlib.util.module_from_spec(spec)
spec.loader.exec_module(align)


class AlignmentTests(unittest.TestCase):
    def test_original_wording_and_repeated_words(self):
        original = 'Go,  go!\n'
        result = align.normalize_alignment(original, [{"words": [
            {"word": "Go,", "start": 0.5, "end": 0.7},
            {"word": " go!", "start": 1.0, "end": 1.2}]}])
        words = result["sentences"][0]["words"]
        self.assertEqual(''.join(w['text'] for w in words), original)
        self.assertEqual(words[1]['startMs'], 1000)

    def test_changed_wording_and_zero_duration_stop(self):
        for word in [{"word": "Wrong", "start": 0, "end": 1}, {"word": "Hello", "start": 0, "end": 0}]:
            with self.assertRaises(ValueError):
                align.normalize_alignment('Hello', [{"words": [word]}])

    def test_material_disagreement_identifies_passage(self):
        result = align.disagreement('Every word matters.', 'The train arrives tomorrow.')
        self.assertLess(result['similarity'], 0.8)
        self.assertIn('every word matters', result['passages'][0]['supplied'])


if __name__ == '__main__':
    unittest.main()
