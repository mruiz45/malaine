'use client';

import React from 'react';

export default function TypeOfYarnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gray-200 rounded mb-6 flex items-center justify-center">
            <span className="text-gray-400 text-3xl">🧶</span>
          </div>
          <h1 className="text-4xl font-bold text-yellow-700 mb-2 text-center">Yarn Categories & Types</h1>
          <p className="text-lg text-gray-600 text-center mb-4">Where the magic starts</p>
        </div>

        {/* Animal-Based Fibres */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">1. 🐑🐐🐇🐛</span>Animal-Based Fibres</h2>
          <p className="text-gray-600 mb-4">These fibres are derived from animals and are known for their warmth, softness, and natural properties.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-yellow-700 flex items-center mb-1"><span className="mr-2">🐑</span>Wool</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><b>Merino Wool:</b> Soft, breathable, and elastic. Ideal for garments like sweaters and socks.</li>
                <li><b>Icelandic Wool:</b> Lightweight and warm, with a unique structure that provides water resistance. Commonly used for outerwear.</li>
                <li><b>Lambswool:</b> The first shearing of a sheep, known for its softness and fine texture. Suitable for delicate garments.</li>
              </ul>
              <h3 className="font-bold text-yellow-700 flex items-center mb-1"><span className="mr-2">🐐</span>Goat Fibres</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><b>Cashmere:</b> Luxuriously soft and lightweight, often blended with other fibres due to cost. Best for scarves, shawls, and fine garments.</li>
                <li><b>Mohair:</b> From the Angora goat, known for its sheen and drape. Often used in lace shawls and lightweight garments.</li>
                <li><b>Cashgora:</b> A blend of cashmere and mohair, offering a balance of softness and durability.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-700 flex items-center mb-1"><span className="mr-2">🐐</span>Camelid Fibres</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><b>Alpaca:</b> Soft and warm, hypoallergenic, and lanolin-free. Available in Huacaya (fluffy) and Suri (silky) types.</li>
                <li><b>Llama:</b> Similar to alpaca but coarser; used for outerwear and accessories.</li>
                <li><b>Qiviut:</b> From the musk ox, extremely soft and warm. Rare and expensive, often used for luxury items.</li>
              </ul>
              <h3 className="font-bold text-yellow-700 flex items-center mb-1"><span className="mr-2">🐇</span>Rabbit Fibres</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><b>Angora:</b> From Angora rabbits, incredibly soft and fluffy. Often blended due to its delicate nature.</li>
              </ul>
              <h3 className="font-bold text-yellow-700 flex items-center mb-1"><span className="mr-2">🐛</span>Insect Fibres</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li><b>Silk:</b> Produced by silkworms, known for its lustrous sheen and strength. Used in fine lace and summer garments.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Plant-Based Fibres */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">2. 🌿</span>Plant-Based Fibres</h2>
          <p className="text-gray-600 mb-4">These fibres are derived from plants and are appreciated for their breathability and eco-friendliness.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="list-disc list-inside text-gray-700">
              <li><b>Cotton:</b> Soft and breathable, commonly used for dishcloths, summer garments, and baby items.</li>
              <li><b>Linen:</b> Made from flax, strong and absorbent. Ideal for summer wear but can be stiff.</li>
              <li><b>Hemp:</b> Durable and eco-friendly, often used in rustic or bohemian-style garments.</li>
              <li><b>Bamboo:</b> Soft and silky, with natural antibacterial properties. Suitable for lightweight garments.</li>
            </ul>
            <ul className="list-disc list-inside text-gray-700">
              <li><b>Jute:</b> Coarse and strong, typically used for home decor items like rugs and bags.</li>
              <li><b>Ramie:</b> Similar to linen but more durable. Often blended with other fibres for strength.</li>
              <li><b>Soy Silk:</b> A byproduct of tofu production, soft and lustrous. Used in luxury garments.</li>
              <li><b>Tencel (Lyocell):</b> Made from wood pulp, soft and biodegradable. Suitable for drapey garments.</li>
            </ul>
          </div>
        </section>

        {/* Synthetic & Semi-Synthetic Fibres */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">3. 🧪🌱</span>Synthetic & Semi-Synthetic Fibres</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-yellow-700 mb-1 flex items-center"><span className="mr-2">🧪</span>Synthetic Fibres</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><b>Acrylic:</b> Inexpensive and easy to care for. Commonly used for blankets, toys, and beginner projects.</li>
                <li><b>Nylon:</b> Strong and elastic, often blended with other fibres for added durability.</li>
                <li><b>Polyester:</b> Durable and resistant to shrinking. Often used in blends to add strength and reduce cost.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-700 mb-1 flex items-center"><span className="mr-2">🌱</span>Semi-Synthetic Fibres</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li><b>Rayon:</b> Made from wood pulp, soft and absorbent. Often used in lightweight garments.</li>
                <li><b>Modal:</b> A type of rayon made from beech trees, known for its softness and drape.</li>
                <li><b>Acetate:</b> Made from wood pulp, lustrous and smooth. Often used for linings and formal wear.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Yarn Weights & Uses */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">🧵</span>Yarn Weight Guide with Symbols, Tools, and Fiber Categories</h2>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-gray-700 border border-gray-200 rounded-lg">
              <thead className="bg-stone-100">
                <tr>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Yarn Weight</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Symbol</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Common Names</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Gauge (Knitting)</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Recommended Needle Size</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Gauge (Crochet)</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Recommended Hook Size</th>
                  <th className="py-2 px-2 font-semibold whitespace-normal break-words">Fiber Categories</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">0</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Lace</td>
                  <td className="py-2 px-2 whitespace-normal break-words">33–40 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">1.5–2.25 mm<br/>(US 000–1)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">32–42 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Steel 6–8, B–1</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Fingering, 10-count crochet thread</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">1</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Super Fine<br/><span className='text-xs'>(Sock, Fingering, Baby)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">27–32 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">2.25–3.25 mm<br/>(US 1–3)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">21–32 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">B–1 to E–4</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Sock, Fingering, Baby</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">2</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Fine<br/><span className='text-xs'>(Sport, Baby)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">23–26 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">3.25–3.75 mm<br/>(US 3–5)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">16–20 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">E–4 to 7</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Sport, Baby</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">3</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Light<br/><span className='text-xs'>(DK, Light Worsted)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">21–24 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">3.75–4.5 mm<br/>(US 5–7)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">12–17 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">7 to I–9</td>
                  <td className="py-2 px-2 whitespace-normal break-words">DK, Light Worsted</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">4</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Medium<br/><span className='text-xs'>(Worsted, Afghan, Aran)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">16–20 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">4.5–5.5 mm<br/>(US 7–9)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">11–14 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">I–9 to K–10½</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Worsted, Afghan, Aran</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">5</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Bulky<br/><span className='text-xs'>(Chunky, Craft, Rug)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">12–15 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">5.5–8 mm<br/>(US 9–11)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">8–11 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">K–10½ to M–13</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Chunky, Craft, Rug</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">6</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Super Bulky<br/><span className='text-xs'>(Roving)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">7–11 sts/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">8–12.75 mm<br/>(US 11–17)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">7–9 sc/4"</td>
                  <td className="py-2 px-2 whitespace-normal break-words">M–13 to Q</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Super Bulky, Roving</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 whitespace-normal break-words">7</td>
                  <td className="py-2 px-2 whitespace-normal break-words">🧵</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Jumbo<br/><span className='text-xs'>(Roving)</span></td>
                  <td className="py-2 px-2 whitespace-normal break-words">6 sts/4" or fewer</td>
                  <td className="py-2 px-2 whitespace-normal break-words">12.75 mm+<br/>(US 17+)</td>
                  <td className="py-2 px-2 whitespace-normal break-words">6 sc/4" or fewer</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Q and larger</td>
                  <td className="py-2 px-2 whitespace-normal break-words">Jumbo, Roving</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Care Instructions */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">🧼</span>Care Instructions</h2>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li><b>Machine Washable:</b> Acrylic, cotton, bamboo, nylon, polyester.</li>
            <li><b>Hand Wash Only:</b> Wool, alpaca, silk, cashmere, mohair.</li>
            <li><b>Dry Clean Only:</b> Silk, cashmere, angora.</li>
            <li><b>Special Treatments:</b> Some wool yarns are treated to be machine washable (e.g., superwash wool).</li>
          </ul>
        </section>

        {/* Major Yarn-Producing Regions */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">🌍</span>Major Yarn-Producing Regions</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li><b>South America:</b> Alpaca, llama, and qiviut are primarily produced in Peru, Bolivia, and Argentina.</li>
            <li><b>China & India:</b> Major producers of silk, cotton, and synthetic fibres.</li>
            <li><b>Turkey & South Africa:</b> Known for mohair production.</li>
            <li><b>United States:</b> Produces a variety of fibres, including wool, cotton, and synthetic blends.</li>
            <li><b>Europe:</b> Italy and the UK are known for high-quality wool and cashmere yarns.</li>
          </ul>
        </section>

        {/* Additional Considerations */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center"><span className="mr-2">🧠</span>Additional Considerations</h2>
          <p className="text-gray-700">Blends: Many yarns are blends of different fibres to combine desirable qualities.</p>
        </section>
      </div>
    </div>
  );
} 