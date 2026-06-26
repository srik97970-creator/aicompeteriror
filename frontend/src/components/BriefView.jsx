import { useRef, useState } from 'react';
import { useToast } from './ui/Toast';
import { api } from '../api';
import { useTranslation } from '../utils/i18n';
import { Copy, Download, Share2, RotateCcw, Check, Star, Printer, MessageSquare, Sparkles, BookOpen, HelpCircle, TrendingUp, FileText, Volume2, VolumeX } from 'lucide-react';
export default function BriefView({ brief, reportId, onRegenerate, staffName, competitorName, ourName, initialRating }) {
    const { success, error: toastError } = useToast();
    const { t, currentLanguage } = useTranslation();
    const printRef = useRef(null);
    // Feedback states
    const [rating, setRating] = useState(initialRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(!!initialRating);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [copied, setCopied] = useState(false);
    // Voice Assistant TTS states
    const [speakingText, setSpeakingText] = useState(null);
    // Speech Synthesizer read-aloud handler
    const handleSpeak = (text) => {
        if (!window.speechSynthesis) {
            toastError('Text-to-Speech is not supported in this browser.');
            return;
        }
        if (speakingText) {
            window.speechSynthesis.cancel();
            if (speakingText === text) {
                setSpeakingText(null);
                return;
            }
        }
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            // Auto-set vocal pitch mapping based on current UI translation preference
            if (currentLanguage === 'hi')
                utterance.lang = 'hi-IN';
            else if (currentLanguage === 'te')
                utterance.lang = 'te-IN';
            else
                utterance.lang = 'en-US';
            utterance.onstart = () => {
                setSpeakingText(text);
            };
            utterance.onend = () => {
                setSpeakingText(null);
            };
            utterance.onerror = () => {
                setSpeakingText(null);
            };
            window.speechSynthesis.speak(utterance);
        }
        catch (e) {
            console.error('Speech synthesis initialization failed:', e);
            setSpeakingText(null);
        }
    };
    // Stop any active TTS voice synthesis
    const handleStopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setSpeakingText(null);
        }
    };
    // Copy brief text
    const handleCopy = () => {
        try {
            let text = `NETHI MALLIKARJUN GUPTA - SALES COMPARISON BRIEF\n`;
            text += `==================================================\n`;
            text += `Staff: ${staffName} | Comparison: ${ourName} vs ${competitorName}\n\n`;
            text += `EXECUTIVE SUMMARY\n`;
            text += `-----------------\n`;
            text += `${brief.executiveSummary}\n\n`;
            text += `COMPARISON MATRIX\n`;
            text += `-----------------\n`;
            brief.comparisonTable.forEach(row => {
                text += `• Feature: ${row.feature}\n`;
                text += `  Competitor (${competitorName}): ${row.competitor}\n`;
                text += `  Ours (${ourName}): ${row.ours}\n`;
                text += `  Advantage: ${row.keyAdvantages}\n`;
                text += `  Value Prop: ${row.valueProposition}\n\n`;
            });
            text += `KEY ADVANTAGES\n`;
            text += `--------------\n`;
            brief.advantages.forEach(a => { text += `- ${a}\n`; });
            text += `\nVALUE PROPOSITION\n`;
            text += `-----------------\n`;
            text += `${brief.valueProposition}\n\n`;
            text += `FLOOR TALKING POINTS\n`;
            text += `--------------------\n`;
            brief.talkingPoints.forEach(tp => { text += `- "${tp}"\n`; });
            text += `\nOBJECTION HANDLING\n`;
            text += `------------------\n`;
            brief.objectionHandling.forEach(obj => {
                text += `Objection: "${obj.objection}"\n`;
                text += `Response: "${obj.response}"\n\n`;
            });
            text += `RECOMMENDATION\n`;
            text += `--------------\n`;
            text += `${brief.recommendation}\n`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            success('Brief copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
            toastError('Failed to copy to clipboard.');
        }
    };
    // Download plain TXT brief
    const handleDownloadTxt = () => {
        try {
            let text = `NETHI MALLIKARJUN GUPTA - SALES COMPARISON BRIEF\n`;
            text += `==================================================\n`;
            text += `Staff: ${staffName} | Comparison: ${ourName} vs ${competitorName}\n\n`;
            text += `EXECUTIVE SUMMARY\n`;
            text += `${brief.executiveSummary}\n\n`;
            text += `COMPARISON MATRIX\n`;
            brief.comparisonTable.forEach(row => {
                text += `[${row.feature.toUpperCase()}]\n`;
                text += `- Competitor (${competitorName}): ${row.competitor}\n`;
                text += `- Company Product (${ourName}): ${row.ours}\n`;
                text += `- Advantage: ${row.keyAdvantages}\n`;
                text += `- Value Proposition: ${row.valueProposition}\n\n`;
            });
            text += `ADVANTAGES\n`;
            brief.advantages.forEach(a => { text += `- ${a}\n`; });
            text += `\nVALUE PROPOSITION\n${brief.valueProposition}\n\n`;
            text += `TALKING POINTS\n`;
            brief.talkingPoints.forEach(tp => { text += `- "${tp}"\n`; });
            text += `\nOBJECTION HANDLING\n`;
            brief.objectionHandling.forEach(obj => {
                text += `Q: "${obj.objection}"\nA: "${obj.response}"\n\n`;
            });
            text += `RECOMMENDATION\n${brief.recommendation}\n`;
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `brief-${ourName.replace(/\s+/g, '_')}-vs-${competitorName.replace(/\s+/g, '_')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            success('Brief text file downloaded.');
        }
        catch (e) {
            toastError('Failed to download text file.');
        }
    };
    // Print styled PDF
    const handlePrintPdf = () => {
        window.print();
    };
    // Share Link
    const handleShare = () => {
        try {
            const shareUrl = `${window.location.origin}/generate?open=${reportId}`;
            navigator.clipboard.writeText(shareUrl);
            success('Shareable link copied to clipboard!');
        }
        catch (e) {
            toastError('Failed to generate share link.');
        }
    };
    // Submit star reviews
    const handleSubmitFeedback = async () => {
        if (rating === 0)
            return;
        setSubmittingFeedback(true);
        try {
            await api.post('/api/feedback', {
                comparison_id: reportId,
                rating,
                comment
            });
            setFeedbackSubmitted(true);
            success('Thank you! Feedback rating submitted.');
        }
        catch (err) {
            toastError(err.message || 'Failed to submit rating.');
        }
        finally {
            setSubmittingFeedback(false);
        }
    };
    // Helper texts to speak entire sections
    const getTalkingPointsSpeechText = () => {
        return brief.talkingPoints.map((tp, idx) => `Talking Point ${idx + 1}: ${tp}`).join('. ');
    };
    const getObjectionsSpeechText = () => {
        return brief.objectionHandling.map((item, idx) => `Objection ${idx + 1}: ${item.objection}. Response: ${item.response}`).join('. ');
    };
    const getAdvantagesSpeechText = () => {
        return brief.advantages.join('. ') + '. ' + brief.valueProposition;
    };
    return (<div className="space-y-8 animate-slide-up" ref={printRef}>
      
      {/* Printable page stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #ddd !important;
            background: white !important;
            box-shadow: none !important;
            color: black !important;
          }
          .print-title {
            color: black !important;
          }
        }
      `}</style>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400"/>
          <span className="font-bold text-sm text-slate-200">{t('briefGeneratedTitle')}</span>
          {speakingText && (<button onClick={handleStopSpeaking} className="ml-3 flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-bold animate-pulse">
              <VolumeX className="w-3 h-3"/> Stop Reading
            </button>)}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            {copied ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
            {t('copyBtn')}
          </button>
          <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            <Download className="w-4 h-4"/>
            {t('txtBtn')}
          </button>
          <button onClick={handlePrintPdf} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            <Printer className="w-4 h-4"/>
            {t('pdfBtn')}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            <Share2 className="w-4 h-4"/>
            {t('shareBtn')}
          </button>
          <button onClick={onRegenerate} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
            <RotateCcw className="w-4 h-4"/>
            {t('regenerateBtn')}
          </button>
        </div>
      </div>

      {/* Main Content Brief */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 print-card shadow-2xl">
        
        {/* Header Block */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {t('storeBrandName')}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 print-title mt-3">
              {t('generatorTitle')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comparing: <strong className="text-slate-350">{ourName}</strong> vs <strong className="text-slate-350">{competitorName}</strong>
            </p>
          </div>
          <div className="text-left md:text-right text-[11px] text-slate-400 space-y-0.5">
            <p><strong>{t('preparedBy')}:</strong> {staffName}</p>
            <p><strong>{t('generatedOn')}:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400"/>
              {t('executiveSummaryTitle')}
            </h3>
            <button onClick={() => handleSpeak(brief.executiveSummary)} className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border no-print cursor-pointer ${speakingText === brief.executiveSummary
            ? 'bg-red-500/20 text-red-500 border-red-500/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-indigo-450'}`}>
              <Volume2 className="w-3.5 h-3.5"/>
              {speakingText === brief.executiveSummary ? 'Mute' : 'Listen'}
            </button>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed text-justify">
            {brief.executiveSummary}
          </p>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400"/>
            {t('sideMatrixTitle')}
          </h3>
          <div className="overflow-x-auto border border-slate-800/80 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 font-bold">{t('matrixFeatureCol')}</th>
                  <th className="px-4 py-3.5 font-bold">{t('matrixCompetitorCol', { name: competitorName })}</th>
                  <th className="px-4 py-3.5 font-bold bg-indigo-950/30 text-indigo-300">{t('matrixOursCol', { name: ourName })}</th>
                  <th className="px-4 py-3.5 font-bold">{t('matrixAdvantageCol')}</th>
                  <th className="px-4 py-3.5 font-bold">{t('matrixValueCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {brief.comparisonTable.map((row, index) => (<tr key={index} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-200">{row.feature}</td>
                    <td className="px-4 py-4 leading-relaxed">{row.competitor}</td>
                    <td className="px-4 py-4 bg-indigo-950/15 text-slate-250 leading-relaxed font-semibold">{row.ours}</td>
                    <td className="px-4 py-4 text-indigo-400 leading-relaxed font-medium">{row.keyAdvantages}</td>
                    <td className="px-4 py-4 leading-relaxed">{row.valueProposition}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advantages & Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4.5 h-4.5 text-indigo-400"/>
                {t('companyAdvantagesTitle')}
              </h3>
              <button onClick={() => handleSpeak(getAdvantagesSpeechText())} className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border no-print cursor-pointer ${speakingText === getAdvantagesSpeechText()
            ? 'bg-red-500/20 text-red-500 border-red-500/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-indigo-450'}`}>
                <Volume2 className="w-3.5 h-3.5"/>
                {speakingText === getAdvantagesSpeechText() ? 'Mute' : 'Listen'}
              </button>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {brief.advantages.map((adv, i) => (<li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 mt-1.5 shrink-0"/>
                  <span className="leading-relaxed">{adv}</span>
                </li>))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400"/>
              {t('valuePropTitle')}
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed text-justify bg-slate-950/50 p-4 border border-slate-850/50 rounded-2xl">
              {brief.valueProposition}
            </p>
          </div>
        </div>

        {/* Talking Points & Objection Handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400"/>
                {t('salesTalkingPointsTitle')}
              </h3>
              <button onClick={() => handleSpeak(getTalkingPointsSpeechText())} className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border no-print cursor-pointer ${speakingText === getTalkingPointsSpeechText()
            ? 'bg-red-500/20 text-red-500 border-red-500/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-indigo-450'}`}>
                <Volume2 className="w-3.5 h-3.5"/>
                {speakingText === getTalkingPointsSpeechText() ? 'Mute' : 'Listen'}
              </button>
            </div>
            <div className="space-y-3">
              {brief.talkingPoints.map((tp, i) => (<div key={i} className="bg-slate-950/30 border-l-2 border-indigo-500 p-3 rounded-r-xl">
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    "{tp}"
                  </p>
                </div>))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400"/>
                {t('objectionHandlingTitle')}
              </h3>
              <button onClick={() => handleSpeak(getObjectionsSpeechText())} className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border no-print cursor-pointer ${speakingText === getObjectionsSpeechText()
            ? 'bg-red-500/20 text-red-500 border-red-500/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-indigo-450'}`}>
                <Volume2 className="w-3.5 h-3.5"/>
                {speakingText === getObjectionsSpeechText() ? 'Mute' : 'Listen'}
              </button>
            </div>
            <div className="space-y-4">
              {brief.objectionHandling.map((item, i) => (<div key={i} className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl space-y-1.5">
                  <p className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                    <span className="bg-red-500/10 px-1.5 py-0.5 rounded text-[9px] uppercase">{t('objectionBadge')}</span>
                    "{item.objection}"
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed pl-1">
                    <strong className="text-indigo-400 font-bold mr-1">{t('responsePrefix')}</strong>
                    "{item.response}"
                  </p>
                </div>))}
            </div>
          </div>
        </div>

        {/* Closing Recommendation */}
        <div className="bg-indigo-950/10 border border-indigo-500/25 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider">
              {t('closingRecommendationTitle')}
            </h3>
            <button onClick={() => handleSpeak(brief.recommendation)} className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border no-print cursor-pointer ${speakingText === brief.recommendation
            ? 'bg-red-500/20 text-red-550 border-red-500/30'
            : 'bg-slate-950/40 border-indigo-500/20 text-slate-400 hover:text-indigo-400'}`}>
              <Volume2 className="w-3.5 h-3.5"/>
              {speakingText === brief.recommendation ? 'Mute' : 'Listen'}
            </button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed text-justify">
            {brief.recommendation}
          </p>
        </div>

      </div>

      {/* Star Feedback Form */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-2xl mx-auto shadow-xl">
        <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-indigo-400"/>
          {t('feedbackTitle')}
        </h3>
        
        {feedbackSubmitted ? (<div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 text-xs font-semibold text-center">
            ✔ {t('feedbackSuccess')}
          </div>) : (<div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('feedbackDesc')}
            </p>
            
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((stars) => (<button key={stars} type="button" onMouseEnter={() => setHoverRating(stars)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(stars)} className="p-1 rounded-lg text-slate-650 hover:bg-slate-850 transition-colors cursor-pointer">
                  <Star className={`w-6 h-6 ${stars <= (hoverRating || rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-700'}`}/>
                </button>))}
            </div>

            {/* Comment */}
            <div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-slate-105 placeholder-slate-500 focus:outline-none min-h-[70px]" placeholder="Optional comments on adjustments needed (e.g. key specifications to highlight)..."/>
            </div>

            {/* Submit */}
            <button onClick={handleSubmitFeedback} disabled={rating === 0 || submittingFeedback} className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-755 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer">
              {submittingFeedback ? 'Submitting...' : t('submitReviewBtn')}
            </button>
          </div>)}
      </div>

    </div>);
}
