export const timeAgo = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ឥឡូវនេះ';
  if (minutes < 60) return `${minutes}នាទីមុន`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}ម៉ោងមុន`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}ថ្ងៃមុន`;
  return new Date(value).toLocaleDateString('en-CA');
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};