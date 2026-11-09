/**
 * Clean, production-grade utility to share documents to WhatsApp or native share sheet
 */
export const shareToWhatsApp = async ({ id, type = 'note', title, subject }) => {
  if (!id) return;

  const noteTitle = title || 'Study Material';
  const subjectTag = subject ? ` (${subject})` : '';
  const shareUrl = `${window.location.origin}/pdf-viewer?type=${type}&id=${id}`;
  const fullMessage = `📚 NoteShare: *${noteTitle}*${subjectTag}\nRead this document securely on NoteShare:\n${shareUrl}`;

  // If running on mobile browser or device with Web Share API supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: `NoteShare - ${noteTitle}`,
        text: `📚 NoteShare: *${noteTitle}*${subjectTag}\nRead this document securely:`,
        url: shareUrl,
      });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        // User deliberately cancelled the share dialog
        return;
      }
    }
  }

  // Direct WhatsApp Web / Mobile URL fallback
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
