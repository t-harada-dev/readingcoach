import { describe, expect, it } from 'vitest';

import { validateProgressToggleInputs } from './bookDetailProgressGuard';

describe('validateProgressToggleInputs', () => {
  it('OFF→ON: 総ページ数欠落でON不可', () => {
    const result = validateProgressToggleInputs('', '10');
    expect(result).toEqual({ ok: false, reason: 'missing_page_count' });
  });

  it('OFF→ON: 現在ページ欠落でON不可', () => {
    const result = validateProgressToggleInputs('300', '');
    expect(result).toEqual({ ok: false, reason: 'missing_current_page' });
  });

  it('OFF→ON: currentPage > pageCount でON不可', () => {
    const result = validateProgressToggleInputs('120', '121');
    expect(result).toEqual({ ok: false, reason: 'current_exceeds_page_count' });
  });

  it('OFF→ON: 条件充足時のみON可', () => {
    const result = validateProgressToggleInputs('120', '100');
    expect(result).toEqual({ ok: true });
  });
});
