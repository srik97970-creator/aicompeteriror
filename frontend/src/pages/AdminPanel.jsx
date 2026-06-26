import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../components/ui/Toast';
import { Users, Package, Settings as SettingsIcon, Sparkles, Trash2, Plus, Check, Info } from 'lucide-react';
export default function AdminPanel() {
    const { success, error: toastError } = useToast();
    const [activeTab, setActiveTab] = useState('users');
    // Loading states
    const [loading, setLoading] = useState(false);
    // Lists Data
    const [usersList, setUsersList] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [templatesList, setTemplatesList] = useState([]);
    const [promptsList, setPromptsList] = useState([]);
    // Create Form States - Users
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('sales_staff');
    // Create Form States - Products
    const [newProdName, setNewProdName] = useState('');
    const [newProdCategory, setNewProdCategory] = useState('');
    const [newProdFeatures, setNewProdFeatures] = useState('');
    // Create Form States - Templates
    const [newTempName, setNewTempName] = useState('');
    const [newTempCompProd, setNewTempCompProd] = useState('');
    const [newTempCompBrand, setNewTempCompBrand] = useState('');
    const [newTempCompFeat, setNewTempCompFeat] = useState('');
    const [newTempCustReq, setNewTempCustReq] = useState('');
    const [newTempOurProd, setNewTempOurProd] = useState('');
    const [newTempOurFeat, setNewTempOurFeat] = useState('');
    const [newTempNotes, setNewTempNotes] = useState('');
    // Create Form States - AI Prompts
    const [newPromptName, setNewPromptName] = useState('');
    const [newPromptText, setNewPromptText] = useState('');
    // Load Tab Data
    const loadTabData = async (tab) => {
        setLoading(true);
        try {
            if (tab === 'users') {
                const data = await api.get('/api/admin/users');
                setUsersList(data);
            }
            else if (tab === 'products') {
                const data = await api.get('/api/products');
                setProductsList(data);
            }
            else if (tab === 'templates') {
                const data = await api.get('/api/templates');
                setTemplatesList(data);
            }
            else if (tab === 'prompts') {
                const data = await api.get('/api/prompts');
                setPromptsList(data);
            }
        }
        catch (err) {
            toastError(err.message || `Failed to fetch ${tab} data.`);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);
    // Create User Submit
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole
            });
            success(`User account created successfully for ${newUserName}.`);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('sales_staff');
            loadTabData('users');
        }
        catch (err) {
            toastError(err.message || 'Failed to create user account.');
        }
    };
    // Delete User
    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/api/admin/users/${id}`);
            success('User account deleted.');
            loadTabData('users');
        }
        catch (err) {
            toastError(err.message || 'Failed to delete user.');
        }
    };
    // Create Product Submit
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/products', {
                name: newProdName,
                category: newProdCategory,
                features: newProdFeatures
            });
            success(`Product ${newProdName} added to catalog.`);
            setNewProdName('');
            setNewProdCategory('');
            setNewProdFeatures('');
            loadTabData('products');
        }
        catch (err) {
            toastError(err.message || 'Failed to add product.');
        }
    };
    // Delete Product
    const handleDeleteProduct = async (id) => {
        try {
            await api.delete(`/api/products/${id}`);
            success('Product removed.');
            loadTabData('products');
        }
        catch (err) {
            toastError(err.message || 'Failed to delete product.');
        }
    };
    // Create Template Presets Submit
    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/templates', {
                name: newTempName,
                competitor_product: newTempCompProd,
                competitor_brand: newTempCompBrand,
                competitor_features: newTempCompFeat,
                customer_requirements: newTempCustReq,
                our_product: newTempOurProd,
                our_features: newTempOurFeat,
                additional_notes: newTempNotes
            });
            success(`Template Preset ${newTempName} configured successfully.`);
            setNewTempName('');
            setNewTempCompProd('');
            setNewTempCompBrand('');
            setNewTempCompFeat('');
            setNewTempCustReq('');
            setNewTempOurProd('');
            setNewTempOurFeat('');
            setNewTempNotes('');
            loadTabData('templates');
        }
        catch (err) {
            toastError(err.message || 'Failed to configure template preset.');
        }
    };
    // Delete Template Preset
    const handleDeleteTemplate = async (id) => {
        try {
            await api.delete(`/api/templates/${id}`);
            success('Template preset deleted.');
            loadTabData('templates');
        }
        catch (err) {
            toastError(err.message || 'Failed to delete template preset.');
        }
    };
    // Create System Prompt Configuration
    const handleCreatePrompt = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/prompts', {
                name: newPromptName,
                system_prompt: newPromptText,
                is_active: false
            });
            success(`System Prompt ${newPromptName} added.`);
            setNewPromptName('');
            setNewPromptText('');
            loadTabData('prompts');
        }
        catch (err) {
            toastError(err.message || 'Failed to add system prompt.');
        }
    };
    // Toggle Prompt Active Status
    const handleTogglePromptActive = async (id, currentActive) => {
        if (currentActive)
            return; // Cannot deactivate active prompt directly (must activate another)
        try {
            await api.put(`/api/prompts/${id}`, { is_active: true });
            success('Active system-wide system prompt updated.');
            loadTabData('prompts');
        }
        catch (err) {
            toastError(err.message || 'Failed to update system prompt status.');
        }
    };
    // Delete Prompt
    const handleDeletePrompt = async (id) => {
        try {
            await api.delete(`/api/prompts/${id}`);
            success('Prompt configuration deleted.');
            loadTabData('prompts');
        }
        catch (err) {
            toastError(err.message || 'Failed to delete prompt.');
        }
    };
    const loggedInUser = api.getUser();
    return (<div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-500 animate-spin-slow"/>
          Admin Panel Dashboard
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage floor terminals, inventory mappings, pre-fill settings, and system-wide LLM prompts.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 gap-1.5 scrollbar-none overflow-x-auto">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'users'
            ? 'border-indigo-500 text-slate-150 bg-indigo-500/5'
            : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
          <Users className="w-4 h-4"/>
          Floor Terminals
        </button>

        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'products'
            ? 'border-indigo-500 text-slate-150 bg-indigo-500/5'
            : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
          <Package className="w-4 h-4"/>
          Product Catalog
        </button>

        <button onClick={() => setActiveTab('templates')} className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'templates'
            ? 'border-indigo-500 text-slate-150 bg-indigo-500/5'
            : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
          <SettingsIcon className="w-4 h-4"/>
          Preset Templates
        </button>

        <button onClick={() => setActiveTab('prompts')} className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'prompts'
            ? 'border-indigo-500 text-slate-150 bg-indigo-500/5'
            : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
          <Sparkles className="w-4 h-4"/>
          AI Prompts Control
        </button>
      </div>

      {/* Tab Screen Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        {loading && (<div className="py-20 text-center space-y-4">
            <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-xs text-slate-500">Synchronizing database changes...</p>
          </div>)}

        {!loading && (<>
            {/* USERS TAB */}
            {activeTab === 'users' && (<div className="space-y-8">
                {/* Create Form */}
                <form onSubmit={handleCreateUser} className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4 max-w-2xl">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-indigo-500"/>
                    Register New Floor Terminal Account
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="Name (e.g. David)"/>
                    <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="Email (name@nethigupta.com)"/>
                    <input type="password" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="Password"/>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Access Role:</span>
                      <label className="flex items-center gap-1.5 select-none cursor-pointer">
                        <input type="radio" name="role" checked={newUserRole === 'sales_staff'} onChange={() => setNewUserRole('sales_staff')} className="text-indigo-600 bg-slate-950 border-slate-850 focus:ring-0"/>
                        Sales Floor Staff
                      </label>
                      <label className="flex items-center gap-1.5 select-none cursor-pointer">
                        <input type="radio" name="role" checked={newUserRole === 'admin'} onChange={() => setNewUserRole('admin')} className="text-indigo-600 bg-slate-950 border-slate-850 focus:ring-0"/>
                        Administrator
                      </label>
                    </div>

                    <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0">
                      Add Account
                    </button>
                  </div>
                </form>

                {/* Users List Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Registered Terminals</h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-855 text-left text-xs">
                      <thead className="bg-slate-950/60 text-[10px] text-slate-405 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold">Employee Name</th>
                          <th className="px-4 py-3 font-bold">Work Email</th>
                          <th className="px-4 py-3 font-bold">System Role</th>
                          <th className="px-4 py-3 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {usersList.map((user) => (<tr key={user.id} className="hover:bg-slate-950/20 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-200">{user.name}</td>
                            <td className="px-4 py-3.5 text-slate-400">{user.email}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wide border ${user.role === 'admin'
                        ? 'bg-indigo-500/10 border-indigo-550/25 text-indigo-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                {user.role === 'admin' ? 'Admin' : 'Sales Staff'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button onClick={() => handleDeleteUser(user.id)} disabled={loggedInUser?.id === user.id} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-30 transition-colors" title={loggedInUser?.id === user.id ? 'You cannot delete yourself' : 'Delete user'}>
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>)}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (<div className="space-y-8">
                {/* Create Form */}
                <form onSubmit={handleCreateProduct} className="bg-slate-950/40 border border-slate-855 p-5 rounded-2xl space-y-4 max-w-2xl">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-indigo-500"/>
                    Register New Company Stocked Product
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product Name</label>
                      <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Sole Fitness F63"/>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                      <input type="text" required value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Treadmills"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Features Description</label>
                    <textarea required value={newProdFeatures} onChange={(e) => setNewProdFeatures(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none min-h-[80px]" placeholder="List motor specs, frame material, bluetooth settings, warranty details to autocomplete in comparison fields..."/>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl transition-colors shrink-0">
                      Save Product
                    </button>
                  </div>
                </form>

                {/* Products Catalog Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Company Inventory Catalog</h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-855 text-left text-xs">
                      <thead className="bg-slate-950/60 text-[10px] text-slate-405 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold w-1/4">Product Name</th>
                          <th className="px-4 py-3 font-bold w-1/6">Category</th>
                          <th className="px-4 py-3 font-bold w-1/2">Features (Autocomplete Source)</th>
                          <th className="px-4 py-3 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {productsList.map((prod) => (<tr key={prod.id} className="hover:bg-slate-950/20 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-200">{prod.name}</td>
                            <td className="px-4 py-3.5 text-indigo-400 capitalize">{prod.category}</td>
                            <td className="px-4 py-3.5 text-slate-400 max-w-[200px] truncate leading-relaxed" title={prod.features}>
                              {prod.features}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete product">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>)}

            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (<div className="space-y-8">
                {/* Create Form */}
                <form onSubmit={handleCreateTemplate} className="bg-slate-950/40 border border-slate-855 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-indigo-500"/>
                    Configure Autofill Comparison Preset Template
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preset Name *</label>
                      <input type="text" required value={newTempName} onChange={(e) => setNewTempName(e.target.value)} className="w-full bg-slate-905 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Gym Treadmill comparison"/>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Competitor Product *</label>
                      <input type="text" required value={newTempCompProd} onChange={(e) => setNewTempCompProd(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Carbon T7"/>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Competitor Brand</label>
                      <input type="text" value={newTempCompBrand} onChange={(e) => setNewTempCompBrand(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. ProForm"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Product (Ours) *</label>
                      <input type="text" required value={newTempOurProd} onChange={(e) => setNewTempOurProd(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Sole Fitness F63"/>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Requirements Concern</label>
                      <input type="text" value={newTempCustReq} onChange={(e) => setNewTempCustReq(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. concerned about warranty, budget"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Competitor Features Details</label>
                      <textarea value={newTempCompFeat} onChange={(e) => setNewTempCompFeat(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none min-h-[60px]" placeholder="e.g. 10% incline, requires subscriptions"/>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Our Product Features Details</label>
                      <textarea value={newTempOurFeat} onChange={(e) => setNewTempOurFeat(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none min-h-[60px]" placeholder="e.g. 15% incline, lifetime motor warranty"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Additional Notes</label>
                    <input type="text" value={newTempNotes} onChange={(e) => setNewTempNotes(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. customer values lifetime parts security"/>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl transition-colors shrink-0">
                      Save Template
                    </button>
                  </div>
                </form>

                {/* Templates presets list table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Configured Template Presets</h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-855 text-left text-xs">
                      <thead className="bg-slate-950/60 text-[10px] text-slate-405 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold w-1/4">Preset Title</th>
                          <th className="px-4 py-3 font-bold w-1/4">Competitor Product</th>
                          <th className="px-4 py-3 font-bold w-1/4">Our Company Product</th>
                          <th className="px-4 py-3 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {templatesList.map((t) => {
                    const data = t.preset_data;
                    return (<tr key={t.id} className="hover:bg-slate-950/20 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-slate-200">{t.name}</td>
                              <td className="px-4 py-3.5 text-slate-405">
                                {data.competitor_brand ? `${data.competitor_brand} ` : ''}{data.competitor_product}
                              </td>
                              <td className="px-4 py-3.5 text-indigo-400 font-semibold">{data.our_product}</td>
                              <td className="px-4 py-3.5 text-center">
                                <button onClick={() => handleDeleteTemplate(t.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete template">
                                  <Trash2 className="w-4 h-4"/>
                                </button>
                              </td>
                            </tr>);
                })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>)}

            {/* AI PROMPTS TAB */}
            {activeTab === 'prompts' && (<div className="space-y-8">
                {/* Create Form */}
                <form onSubmit={handleCreatePrompt} className="bg-slate-950/40 border border-slate-855 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-indigo-500"/>
                    Configure New AI System Instruction Prompt
                  </h3>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prompt Name</label>
                    <input type="text" required value={newPromptName} onChange={(e) => setNewPromptName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none" placeholder="e.g. Bold Floor Persuasive Prompt"/>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">System Instructions Prompt Content</label>
                    <textarea required value={newPromptText} onChange={(e) => setNewPromptText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-250 focus:outline-none min-h-[120px] leading-relaxed" placeholder="Specify tone instructions, tables guidelines, talking points parameters, and custom objection constraints..."/>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl transition-colors shrink-0">
                      Save AI Prompt
                    </button>
                  </div>
                </form>

                {/* Prompts list table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-305 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400"/>
                    Available System Prompts (Only One Can Be Active)
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {promptsList.map((prompt) => (<div key={prompt.id} className={`border rounded-2xl p-5 space-y-3 relative overflow-hidden transition-all ${prompt.isActive
                        ? 'bg-slate-900 border-indigo-500/50 shadow-indigo-500/5'
                        : 'bg-slate-900/40 border-slate-850'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-200">{prompt.name}</h5>
                            <span className="text-[9px] text-slate-500">Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleTogglePromptActive(prompt.id, prompt.isActive)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${prompt.isActive
                        ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'}`}>
                              {prompt.isActive ? (<>
                                  <Check className="w-3.5 h-3.5 text-indigo-400"/>
                                  Active Engine Prompt
                                </>) : ('Set As Active')}
                            </button>

                            <button onClick={() => handleDeletePrompt(prompt.id)} disabled={prompt.isActive} className="p-1.5 text-red-500 hover:bg-red-500/10 border border-transparent rounded-lg disabled:opacity-30 transition-colors" title={prompt.isActive ? 'Active prompt cannot be deleted' : 'Delete prompt'}>
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 bg-slate-955 bg-slate-950/80 p-4 border border-slate-850 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-justify">
                          {prompt.systemPrompt}
                        </p>
                      </div>))}
                  </div>
                </div>
              </div>)}
          </>)}
      </div>

    </div>);
}
