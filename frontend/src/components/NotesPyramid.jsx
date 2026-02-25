import React from 'react';

const NotesPyramid = ({ notes }) => {
    const topNotes = notes?.filter(n => n.type === 'TOP') || [];
    const heartNotes = notes?.filter(n => n.type === 'HEART') || [];
    const baseNotes = notes?.filter(n => n.type === 'BASE') || [];

    return (
        <div className="py-12 border-y border-gray-100 my-12">
            <h3 className="prata-regular text-2xl text-center mb-12 uppercase tracking-widest text-gray-800">Olfactory Composition</h3>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Top Notes */}
                <div className="text-center group">
                    <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-[#FFF0F5] flex items-center justify-center group-hover:bg-[#FFD1DC] transition-colors duration-500">
                        <span className="text-[10px] font-bold tracking-tighter text-gray-400 group-hover:text-white">TOP</span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-800">The Awakening</h4>
                    <div className="space-y-2">
                        {topNotes.map((note, i) => (
                            <p key={i} className="text-sm text-gray-500 font-medium italic">{note.noteName}</p>
                        ))}
                    </div>
                </div>

                {/* Heart Notes */}
                <div className="text-center group">
                    <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-[#FFF0F5] flex items-center justify-center group-hover:bg-[#FFD1DC] transition-colors duration-500">
                        <span className="text-[10px] font-bold tracking-tighter text-gray-400 group-hover:text-white">HEART</span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-800">The Soul</h4>
                    <div className="space-y-2">
                        {heartNotes.map((note, i) => (
                            <p key={i} className="text-sm text-gray-500 font-medium italic">{note.noteName}</p>
                        ))}
                    </div>
                </div>

                {/* Base Notes */}
                <div className="text-center group">
                    <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-[#FFF0F5] flex items-center justify-center group-hover:bg-[#FFD1DC] transition-colors duration-500">
                        <span className="text-[10px] font-bold tracking-tighter text-gray-400 group-hover:text-white">BASE</span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-800">The Memory</h4>
                    <div className="space-y-2">
                        {baseNotes.map((note, i) => (
                            <p key={i} className="text-sm text-gray-500 font-medium italic">{note.noteName}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesPyramid;
