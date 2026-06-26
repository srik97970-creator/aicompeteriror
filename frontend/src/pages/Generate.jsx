import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useTranslation } from '../utils/i18n';
import BriefView from '../components/BriefView';
import { useToast } from '../components/ui/Toast';
import { RefreshCw, HelpCircle, ArrowLeft, Search, Check, FilePlus2, DollarSign, Mic, MicOff } from 'lucide-react';
export default function Generate() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { success, error: toastError } = useToast();
    const { t, currentLanguage } = useTranslation();
    // Form Fields
    const [competitorProduct, setCompetitorProduct] = useState('');
    const [competitorBrand, setCompetitorBrand] = useState('');
    const [competitorFeatures, setCompetitorFeatures] = useState('');
    const [customerRequirements, setCustomerRequirements] = useState('');
    const [budget, setBudget] = useState('');
    const [intendedUsage, setIntendedUsage] = useState('');
    const [ourProduct, setOurProduct] = useState('');
    const [ourFeatures, setOurFeatures] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [briefLanguage, setBriefLanguage] = useState('English');
    // Auto-populated Products & Autocomplete states
    const [productsList, setProductsList] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    // UI States
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [generatedBrief, setGeneratedBrief] = useState(null);
    const [currentReportId, setCurrentReportId] = useState(null);
    const [reportRating, setReportRating] = useState(null);
    const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
    const [newTemplateSaveName, setNewTemplateSaveName] = useState('');
    const [savingTemplate, setSavingTemplate] = useState(false);
    // Voice Dictation state
    const [recordingField, setRecordingField] = useState(null);
    // 1. Initial Load: templates, product catalog, search query params
    useEffect(() => {
        const loadData = async () => {
            try {
                const temps = await api.get('/api/templates');
                setTemplates(temps);
                const prods = await api.get('/api/products');
                setProductsList(prods);
                // Check if loading a preset
                const presetId = searchParams.get('preset');
                if (presetId) {
                    const matched = temps.find(t => t.id === parseInt(presetId));
                    if (matched) {
                        applyPreset(matched.preset_data);
                    }
                }
            }
            catch (err) {
                console.error('Error fetching defaults:', err);
            }
        };
        const loadReport = async (id) => {
            setLoading(true);
            setValidationError('');
            try {
                const report = await api.get(`/api/comparison/${id}`);
                setCurrentReportId(report.id);
                setGeneratedBrief(report.response);
                setReportRating(report.rating);
                // Auto-fill form fields
                setCompetitorProduct(report.competitor_product || '');
                setCompetitorBrand(report.competitor_brand || '');
                setCompetitorFeatures(report.competitor_features || '');
                setCustomerRequirements(report.customer_requirements || '');
                setOurProduct(report.our_product || '');
                setOurFeatures(report.our_features || '');
                setReportRating(report.rating || null);
            }
            catch (err) {
                setValidationError(err.message || 'Failed to retrieve comparison report.');
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
        const openId = searchParams.get('open');
        if (openId) {
            loadReport(openId);
        }
    }, [searchParams]);
    // Set Brief Language state when UI language switches to match it
    useEffect(() => {
        if (currentLanguage === 'hi')
            setBriefLanguage('Hindi');
        else if (currentLanguage === 'te')
            setBriefLanguage('Telugu');
        else
            setBriefLanguage('English');
    }, [currentLanguage]);
    // Apply template values
    const applyPreset = (data) => {
        setCompetitorProduct(data.competitor_product || '');
        setCompetitorBrand(data.competitor_brand || '');
        setCompetitorFeatures(data.competitor_features || '');
        setCustomerRequirements(data.customer_requirements || '');
        setOurProduct(data.our_product || '');
        setOurFeatures(data.our_features || '');
        setProductCategory(data.product_category || '');
        setAdditionalNotes(data.additional_notes || '');
        success('Template preset values applied.');
    };
    const handleTemplateChange = (e) => {
        const tempId = e.target.value;
        if (!tempId)
            return;
        const matched = templates.find(t => t.id === parseInt(tempId));
        if (matched) {
            applyPreset(matched.preset_data);
        }
    };
    // Search product filters
    const handleProductInputChange = (e) => {
        const val = e.target.value;
        setOurProduct(val);
        if (val.trim() === '') {
            setFilteredProducts([]);
            setShowProductDropdown(false);
            return;
        }
        const matches = productsList.filter(p => p.name.toLowerCase().includes(val.toLowerCase()) ||
            p.category.toLowerCase().includes(val.toLowerCase()));
        setFilteredProducts(matches);
        setShowProductDropdown(matches.length > 0);
    };
    const selectProduct = (prod) => {
        setOurProduct(prod.name);
        setOurFeatures(prod.features);
        setProductCategory(prod.category);
        setShowProductDropdown(false);
        success(`Selected ${prod.name} from catalog.`);
    };
    // Dictate Speech-to-Text Handler
    const handleDictation = (fieldId, currentValue, setter) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toastError('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        if (recordingField === fieldId) {
            setRecordingField(null);
            return;
        }
        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            // Match voice language to user UI preference
            if (currentLanguage === 'hi')
                recognition.lang = 'hi-IN';
            else if (currentLanguage === 'te')
                recognition.lang = 'te-IN';
            else
                recognition.lang = 'en-US';
            recognition.onstart = () => {
                setRecordingField(fieldId);
                success('Listening... speak clearly.');
            };
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                if (text) {
                    const updated = currentValue ? `${currentValue} ${text}` : text;
                    setter(updated);
                    success('Dictation successful.');
                }
            };
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    toastError('Microphone access denied. Enable permissions in your browser.');
                }
                else {
                    toastError(`Microphone capture error: ${event.error}`);
                }
                setRecordingField(null);
            };
            recognition.onend = () => {
                setRecordingField(null);
            };
            recognition.start();
        }
        catch (e) {
            console.error('Speech initialization failed:', e);
            setRecordingField(null);
        }
    };
    // Generate Comparison
    const handleGenerate = async (e) => {
        if (e)
            e.preventDefault();
        setValidationError('');
        if (!competitorProduct || !ourProduct) {
            setValidationError(t('validationErrorMsg'));
            return;
        }
        setLoading(true);
        setGeneratedBrief(null);
        setCurrentReportId(null);
        try {
            const payload = {
                competitor_product: competitorProduct,
                competitor_brand: competitorBrand,
                competitor_features: competitorFeatures,
                customer_requirements: customerRequirements,
                budget,
                intended_usage: intendedUsage,
                our_product: ourProduct,
                our_features: ourFeatures,
                product_category: productCategory,
                additional_notes: additionalNotes,
                brief_language: briefLanguage
            };
            const data = await api.post('/api/comparison/generate', payload);
            setCurrentReportId(data.id);
            setGeneratedBrief(data.brief);
            setReportRating(null);
            setSearchParams({ open: data.id.toString() });
            success('AI comparison brief created successfully!');
        }
        catch (err) {
            setValidationError(err.message || 'Brief generation failed. Please try again.');
            toastError('AI generation failed.');
        }
        finally {
            setLoading(false);
        }
    };
    // Save Preset Template Live
    const handleSaveAsTemplate = async (e) => {
        e.preventDefault();
        if (!newTemplateSaveName.trim()) {
            toastError('Please enter a name for the preset template.');
            return;
        }
        setSavingTemplate(true);
        try {
            const payload = {
                name: newTemplateSaveName.trim(),
                competitor_product: competitorProduct,
                competitor_brand: competitorBrand,
                competitor_features: competitorFeatures,
                customer_requirements: customerRequirements,
                our_product: ourProduct,
                our_features: ourFeatures,
                additional_notes: additionalNotes
            };
            const newTemp = await api.post('/api/templates', payload);
            setTemplates((prev) => [newTemp, ...prev]);
            setShowSaveTemplateModal(false);
            setNewTemplateSaveName('');
            success(`Template Preset "${newTemp.name}" created and shared live!`);
        }
        catch (err) {
            toastError(err.message || 'Failed to save preset template.');
        }
        finally {
            setSavingTemplate(false);
        }
    };
    const handleBackToForm = () => {
        setGeneratedBrief(null);
        setCurrentReportId(null);
        setSearchParams({});
    };
    const user = api.getUser();
    return (<div className="space-y-6">
      
      {/* Header Block */}
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <FilePlus2 className="w-6 h-6 text-indigo-500"/>
            {t('generatorTitle')}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {t('generatorSubtitle')}
          </p>
        </div>

        {generatedBrief && (<button onClick={handleBackToForm} className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4"/>
            {t('editInputsBtn')}
          </button>)}
      </div>

      {loading && (<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto animate-spin">
            <RefreshCw className="w-8 h-8"/>
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-200">{t('loadingTitle')}</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
              {t('loadingDesc')}
            </p>
          </div>
          <div className="max-w-md mx-auto h-2 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-[shimmer_2s_infinite] w-3/4"/>
          </div>
        </div>)}

      {validationError && (<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5"/>
          <span>{validationError}</span>
        </div>)}

      {/* Render AI Output Brief View */}
      {!loading && generatedBrief && currentReportId && (<BriefView brief={generatedBrief} reportId={currentReportId} onRegenerate={() => handleGenerate()} staffName={user?.name || 'Sales Professional'} competitorName={competitorBrand ? `${competitorBrand} ${competitorProduct}` : competitorProduct} ourName={ourProduct} initialRating={reportRating}/>)}

      {/* Input Entry Form */}
      {!loading && !generatedBrief && (<form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
          
          {/* Template presets selector */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{t('floorPresetsLabel')}</span>
              <h4 className="text-xs font-bold text-slate-300">{t('autofillPresets')}</h4>
            </div>
            <div className="w-full sm:max-w-xs">
              <select onChange={handleTemplateChange} defaultValue="" className="block w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none">
                <option value="" disabled>{t('presetsDropdownDefault')}</option>
                {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Competitor Product Section */}
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                {t('competitorInfoTitle')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('competitorBrandLabel')}
                    </label>
                    <button type="button" onClick={() => handleDictation('competitorBrand', competitorBrand, setCompetitorBrand)} className={`p-1 rounded-lg transition-colors ${recordingField === 'competitorBrand' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`} title="Speak brand name">
                      <Mic className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <input type="text" value={competitorBrand} onChange={(e) => setCompetitorBrand(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none" placeholder="e.g. Peloton"/>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('competitorProductLabel')}
                    </label>
                    <button type="button" onClick={() => handleDictation('competitorProduct', competitorProduct, setCompetitorProduct)} className={`p-1 rounded-lg transition-colors ${recordingField === 'competitorProduct' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`} title="Speak product name">
                      <Mic className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <input type="text" required value={competitorProduct} onChange={(e) => setCompetitorProduct(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-semibold" placeholder="e.g. Peloton Bike"/>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('competitorFeaturesLabel')}
                  </label>
                  <button type="button" onClick={() => handleDictation('competitorFeatures', competitorFeatures, setCompetitorFeatures)} className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold border transition-colors ${recordingField === 'competitorFeatures'
                ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20'}`}>
                    {recordingField === 'competitorFeatures' ? <MicOff className="w-3 h-3 text-red-500"/> : <Mic className="w-3 h-3"/>}
                    {recordingField === 'competitorFeatures' ? 'Stop' : 'Voice Dictate'}
                  </button>
                </div>
                <textarea value={competitorFeatures} onChange={(e) => setCompetitorFeatures(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none min-h-[100px] leading-relaxed" placeholder={t('competitorFeaturesPlaceholder')}/>
              </div>
            </div>

            {/* Our Product Section */}
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                {t('ourProductTitle')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('ourProductLabel')}
                  </label>
                  <div className="relative">
                    <input type="text" required value={ourProduct} onChange={handleProductInputChange} onFocus={() => ourProduct.length > 0 && setShowProductDropdown(true)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-bold" placeholder={t('ourProductPlaceholder')}/>
                    <Search className="absolute left-2.5 top-3 w-4 h-4 text-slate-550"/>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showProductDropdown && filteredProducts.length > 0 && (<div className="absolute z-[99] mt-1.5 w-full bg-slate-900 border border-slate-800 shadow-xl rounded-xl overflow-hidden divide-y divide-slate-850">
                      {filteredProducts.map(p => (<div key={p.id} onClick={() => selectProduct(p)} className="px-3 py-2.5 text-xs text-slate-350 hover:bg-slate-850 hover:text-white cursor-pointer transition-colors flex items-center justify-between">
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <span className="text-[9px] text-indigo-400 capitalize">{p.category}</span>
                          </div>
                          <Check className="w-3.5 h-3.5 opacity-40"/>
                        </div>))}
                    </div>)}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('ourProductCategoryLabel')}
                  </label>
                  <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-205 placeholder-slate-500 focus:outline-none" placeholder="e.g. Exercise Cycles"/>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('ourProductFeaturesLabel')}
                  </label>
                  <button type="button" onClick={() => handleDictation('ourFeatures', ourFeatures, setOurFeatures)} className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold border transition-colors ${recordingField === 'ourFeatures'
                ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20'}`}>
                    {recordingField === 'ourFeatures' ? <MicOff className="w-3 h-3 text-red-500"/> : <Mic className="w-3 h-3"/>}
                    {recordingField === 'ourFeatures' ? 'Stop' : 'Voice Dictate'}
                  </button>
                </div>
                <textarea value={ourFeatures} onChange={(e) => setOurFeatures(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none min-h-[100px] leading-relaxed" placeholder={t('ourProductFeaturesPlaceholder')}/>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-850/60">
            {/* Customer specs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300">{t('customerRequirementsTitle')}</h4>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('customerRequirementsLabel')}
                  </label>
                  <button type="button" onClick={() => handleDictation('customerRequirements', customerRequirements, setCustomerRequirements)} className={`p-1 rounded-lg transition-colors ${recordingField === 'customerRequirements' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`} title="Speak requirements">
                    <Mic className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <input type="text" value={customerRequirements} onChange={(e) => setCustomerRequirements(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-none" placeholder={t('customerRequirementsPlaceholder')}/>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300">Budget & Intended Usage</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t('customerBudgetLabel')}
                  </label>
                  <div className="relative">
                    <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-none" placeholder="e.g. 1000"/>
                    <DollarSign className="absolute left-2.5 top-3 w-4 h-4 text-slate-550"/>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('intendedUsageLabel')}
                    </label>
                    <button type="button" onClick={() => handleDictation('intendedUsage', intendedUsage, setIntendedUsage)} className={`p-1 rounded-lg transition-colors ${recordingField === 'intendedUsage' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`} title="Speak intended usage">
                      <Mic className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <input type="text" value={intendedUsage} onChange={(e) => setIntendedUsage(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-none" placeholder={t('intendedUsagePlaceholder')}/>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300">{t('additionalNotesTitle')}</h4>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('auxiliaryContextLabel')}
                  </label>
                  <button type="button" onClick={() => handleDictation('additionalNotes', additionalNotes, setAdditionalNotes)} className={`p-1 rounded-lg transition-colors ${recordingField === 'additionalNotes' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`} title="Speak notes">
                    <Mic className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <input type="text" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-none" placeholder={t('auxiliaryContextPlaceholder')}/>
              </div>
            </div>

          </div>

          {/* Action Trigger */}
          <div className="pt-6 border-t border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                {t('briefLanguageLabel')}
              </label>
              <select value={briefLanguage} onChange={(e) => setBriefLanguage(e.target.value)} className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer">
                <option value="English">English</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Telugu">తెలుగు</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => {
                if (!competitorProduct || !ourProduct) {
                    toastError('Please fill in the Competitor Product and Company Product first.');
                    return;
                }
                setShowSaveTemplateModal(true);
            }} className="px-6 py-4 border border-slate-805 hover:bg-slate-800 text-slate-300 font-extrabold rounded-xl transition-all text-sm cursor-pointer">
                Save as Preset
              </button>
              <button type="submit" className="bg-indigo-650 hover:bg-indigo-755 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all text-sm cursor-pointer">
                {t('generateBtn')}
              </button>
            </div>
          </div>

        </form>)}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Save live preset template</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Enter a descriptive title for this preset. It will instantly appear under the "Autofill Presets" dropdown for all sales staff.
              </p>
            </div>
            
            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <input type="text" required value={newTemplateSaveName} onChange={(e) => setNewTemplateSaveName(e.target.value)} placeholder="e.g. iPhone 15 vs Galaxy S24 comparison" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-3 text-xs text-slate-205 placeholder-slate-500 focus:outline-none" autoFocus/>
              
              <div className="flex gap-3 justify-end pt-2 text-xs">
                <button type="button" onClick={() => {
                setShowSaveTemplateModal(false);
                setNewTemplateSaveName('');
            }} className="px-4 py-2.5 border border-slate-800 text-slate-405 hover:text-white rounded-xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={savingTemplate} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                  {savingTemplate ? 'Saving...' : 'Confirm Save'}
                </button>
              </div>
            </form>
          </div>
        </div>)}

    </div>);
}
