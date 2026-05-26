const typeLabel = {
  PRODUCT: 'Producto',
  SERVICE: 'Servicio',
  TRUEQUE: 'Trueque',
  EMPRENDIMIENTO: 'Emprendimiento',
  BOLSA: 'Bolsa',
};

function formatPrice(price, currency = 'ARS') {
  if (price === null || price === undefined) return null;
  const n = Number(price);
  if (Number.isNaN(n)) return null;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingCard({ listing }) {
  const price = formatPrice(listing.price, listing.currency);
  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      {listing.imageUrl ? (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-40 object-cover bg-slate-100"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-white text-3xl font-bold">
          {listing.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="badge bg-slate-100 text-slate-700">{typeLabel[listing.type] || listing.type}</span>
          {listing.visibility === 'UNION_ONLY' && (
            <span className="badge bg-indigo-100 text-indigo-800">Solo sindicato</span>
          )}
        </div>
        <h3 className="mt-2 font-semibold text-slate-900 line-clamp-1">{listing.title}</h3>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{listing.description}</p>
        <div className="mt-3 flex items-center justify-between">
          {price ? (
            <span className="font-bold text-brand-700">{price}</span>
          ) : (
            <span className="text-sm text-slate-400">Consultar</span>
          )}
          <span className="text-xs text-slate-500">{listing.author?.fullName}</span>
        </div>
      </div>
    </div>
  );
}
