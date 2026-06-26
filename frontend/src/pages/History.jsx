import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useTranslation } from '../utils/i18n';
import { useToast } from '../components/ui/Toast';
import { Search, Trash2, Eye, Star, Calendar, Filter, History as HistoryIcon, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
export default function History() {
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const { t } = useTranslation();
    const [comparisons, setComparisons] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    // Filters
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [loading, setLoading] = useState(true);
    // Confirmation modal states
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const url = `/api/comparison/history?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&rating=${ratingFilter}`;
            const res = await api.get(url);
            setComparisons(res.comparisons || []);
            setTotalCount(res.pagination.total);
            setTotalPages(res.pagination.totalPages);
        }
        catch (err) {
            toastError(err.message || 'Could not load comparison history.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchHistory();
    }, [page, ratingFilter]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHistory();
    };
    const handleClearFilters = () => {
        setSearch('');
        setRatingFilter('');
        setPage(1);
    };
    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/comparison/${id}`);
            success(t('feedbackSuccess'));
            setConfirmDeleteId(null);
            if (comparisons.length === 1 && page > 1) {
                setPage(page - 1);
            }
            else {
                fetchHistory();
            }
        }
        catch (err) {
            toastError(err.message || 'Failed to delete report.');
        }
    };
    const handleOpenReport = (id) => {
        navigate(`/generate?open=${id}`);
    };
    const user = api.getUser();
    return (<div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-indigo-500"/>
          {t('historyLogTitle')}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t('historyLogSubtitle')}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="block w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-205 placeholder-slate-500 focus:outline-none" placeholder={t('searchPlaceholder')}/>
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500"/>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-550 shrink-0"/>
              <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }} className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer">
                <option value="">{t('allStarRatings')}</option>
                <option value="5">{t('starRatingFilter', { stars: '5' })}</option>
                <option value="4">{t('starRatingFilter', { stars: '4' })}</option>
                <option value="3">{t('starRatingFilter', { stars: '3' })}</option>
                <option value="2">{t('starRatingFilter', { stars: '2' })}</option>
                <option value="1">{t('starRatingFilter', { stars: '1' })}</option>
              </select>
            </div>

            <button type="submit" className="px-4 py-2 bg-slate-850 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer">
              {t('applyFilterBtn')}
            </button>
            {(search || ratingFilter) && (<button type="button" onClick={handleClearFilters} className="text-xs text-indigo-400 hover:underline font-bold cursor-pointer">
                {t('resetBtn')}
              </button>)}
          </div>
        </form>
      </div>

      {/* Comparisons History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (<div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(n => (<div key={n} className="h-14 bg-slate-950/40 rounded-xl animate-pulse"/>))}
          </div>) : comparisons.length === 0 ? (<div className="p-16 text-center text-slate-500">
            <HistoryIcon className="w-12 h-12 text-slate-700 mx-auto mb-4"/>
            <h3 className="font-extrabold text-slate-305 text-sm">No Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search text or rating filters.</p>
          </div>) : (<div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-850 text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-bold">{t('dateCol')}</th>
                  <th className="px-5 py-4 font-bold">{t('compProdCol')}</th>
                  <th className="px-5 py-4 font-bold">{t('ourProdCol')}</th>
                  {user?.role === 'admin' && <th className="px-5 py-4 font-bold">{t('staffCol')}</th>}
                  <th className="px-5 py-4 font-bold">{t('ratingCol')}</th>
                  <th className="px-5 py-4 font-bold text-center">{t('actionsCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {comparisons.map((row) => (<tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-5 py-4 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-550"/>
                        {new Date(row.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-200">
                      {row.competitor_brand ? `${row.competitor_brand} ` : ''}{row.competitor_product}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-250">
                      {row.our_product}
                    </td>
                    {user?.role === 'admin' && (<td className="px-5 py-4 text-slate-400 font-medium">
                        {row.staff_name}
                      </td>)}
                    <td className="px-5 py-4">
                      {row.rating ? (<div className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-500"/>
                          <span>{t('starRatingFilter', { stars: String(row.rating) })}</span>
                        </div>) : (<span className="text-slate-650">{t('unrated')}</span>)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenReport(row.id)} className="p-1.5 text-indigo-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="View brief output">
                          <Eye className="w-4 h-4"/>
                        </button>
                        <button onClick={() => setConfirmDeleteId(row.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer" title="Delete report log">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (<div className="flex items-center justify-between no-print px-1 py-4">
          <span className="text-[11px] text-slate-500">
            {t('pageIndicator', { page: String(page), totalPages: String(totalPages), total: String(totalCount) })}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-300 disabled:opacity-40 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-300 disabled:opacity-40 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>)}

      {/* Delete Confirmation Modal Overlay */}
      {confirmDeleteId !== null && (<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mx-auto">
              <ShieldAlert className="w-6 h-6"/>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-205 text-sm">{t('deleteLogTitle')}</h3>
              <p className="text-xs text-slate-455 leading-relaxed">
                {t('deleteLogDesc')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-350 transition-colors cursor-pointer">
                {t('cancelBtn')}
              </button>
              <button onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)} className="flex-1 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                {t('deleteBtn')}
              </button>
            </div>
          </div>
        </div>)}

    </div>);
}
