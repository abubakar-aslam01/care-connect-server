import PDFDocument from 'pdfkit';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const generatePrescriptionPdf = async (req, res, next) => {
  try {
    const { hospitalName, doctorName, patientName, notes, date } = req.body;

    if (!hospitalName || !doctorName || !patientName || !notes) {
      const error = new Error('hospitalName, doctorName, patientName, and notes are required');
      error.statusCode = 400;
      throw error;
    }

    const doc = new PDFDocument({ margin: 50 });

    const filenameSafe = `${patientName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filenameSafe}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .fillColor('#111')
      .text(hospitalName, { align: 'center' })
      .moveDown(0.5)
      .fontSize(12)
      .fillColor('#444')
      .text('Prescription', { align: 'center' })
      .moveDown(1.5);

    // Doctor / Patient info
    doc
      .fontSize(12)
      .fillColor('#111')
      .text(`Doctor: ${doctorName}`)
      .text(`Patient: ${patientName}`)
      .text(`Date: ${formatDate(date) || formatDate(new Date())}`)
      .moveDown(1);

    // Notes section
    doc
      .fontSize(12)
      .fillColor('#111')
      .text('Prescription Notes:', { underline: true })
      .moveDown(0.5)
      .fontSize(11)
      .fillColor('#222')
      .text(notes, { align: 'left' });

    doc.end();
  } catch (err) {
    next(err);
  }
};
