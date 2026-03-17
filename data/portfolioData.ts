// data/portfolioData.ts
// AUTO-GENERATED — run: node scripts/generate-portfolio-data.mjs

export interface PortfolioImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface Subcategory {
  id: string
  name: string
  images: PortfolioImage[]
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export function getAllImagesFromCategory(category: Category): PortfolioImage[] {
  return category.subcategories.flatMap(sub => sub.images)
}

export function getImagesFromSubcategory(categoryId: string, subcategoryId: string): PortfolioImage[] {
  const cat = portfolioData.find(c => c.id === categoryId)
  if (!cat) return []
  const sub = cat.subcategories.find(s => s.id === subcategoryId)
  return sub?.images ?? []
}

export const portfolioData: Category[] = [
  {
    "id": "accessories",
    "name": "Accessories",
    "subcategories": [
      {
        "id": "backbag",
        "name": "BackBag",
        "images": [
          {
            "id": "accessories-backbag-01",
            "src": "/assets/portfolio/Accessories/BackBag/Gemini_Generated_Image_8cumg8cumg8cumg8.png",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-backbag-02",
            "src": "/assets/portfolio/Accessories/BackBag/Gemini_Generated_Image_cmm5mkcmm5mkcmm5.png",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-backbag-03",
            "src": "/assets/portfolio/Accessories/BackBag/Gemini_Generated_Image_k43eh7k43eh7k43e.png",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-backbag-04",
            "src": "/assets/portfolio/Accessories/BackBag/Gemini_Generated_Image_m368oim368oim368.png",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-backbag-05",
            "src": "/assets/portfolio/Accessories/BackBag/Gemini_Generated_Image_of59roof59roof59.png",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-backbag-06",
            "src": "/assets/portfolio/Accessories/BackBag/bg02p.6.jpg",
            "alt": "BackBag — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "crossbag",
        "name": "CrossBag",
        "images": [
          {
            "id": "accessories-crossbag-01",
            "src": "/assets/portfolio/Accessories/CrossBag/Gemini_Generated_Image_13f5xn13f5xn13f5.png",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-crossbag-02",
            "src": "/assets/portfolio/Accessories/CrossBag/Gemini_Generated_Image_9sss5q9sss5q9sss.png",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-crossbag-03",
            "src": "/assets/portfolio/Accessories/CrossBag/Gemini_Generated_Image_djmdwqdjmdwqdjmd.png",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-crossbag-04",
            "src": "/assets/portfolio/Accessories/CrossBag/Gemini_Generated_Image_t2dawnt2dawnt2da.png",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-crossbag-05",
            "src": "/assets/portfolio/Accessories/CrossBag/Gemini_Generated_Image_th1szmth1szmth1s.png",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-crossbag-06",
            "src": "/assets/portfolio/Accessories/CrossBag/c7e1d805689230e37d806a2d5f227944.webp",
            "alt": "CrossBag — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "keychain-1",
        "name": "KeyChain 1",
        "images": [
          {
            "id": "accessories-keychain-1-01",
            "src": "/assets/portfolio/Accessories/KeyChain%201/Gemini_Generated_Image_7m0jd7m0jd7m0jd7.png",
            "alt": "KeyChain 1 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain-1-02",
            "src": "/assets/portfolio/Accessories/KeyChain%201/Gemini_Generated_Image_a9pr0da9pr0da9pr.png",
            "alt": "KeyChain 1 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain-1-03",
            "src": "/assets/portfolio/Accessories/KeyChain%201/Gemini_Generated_Image_dz0eo9dz0eo9dz0e.png",
            "alt": "KeyChain 1 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain-1-04",
            "src": "/assets/portfolio/Accessories/KeyChain%201/jrcJz7MNm6oHAExmT0efQoEiaGfVXOXT2er6gBCO.webp",
            "alt": "KeyChain 1 — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "keychain2",
        "name": "KeyChain2",
        "images": [
          {
            "id": "accessories-keychain2-01",
            "src": "/assets/portfolio/Accessories/KeyChain2/Gemini_Generated_Image_4aby254aby254aby.png",
            "alt": "KeyChain2 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain2-02",
            "src": "/assets/portfolio/Accessories/KeyChain2/Gemini_Generated_Image_gfyt5egfyt5egfyt.png",
            "alt": "KeyChain2 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain2-03",
            "src": "/assets/portfolio/Accessories/KeyChain2/Gemini_Generated_Image_p3ke21p3ke21p3ke.png",
            "alt": "KeyChain2 — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-keychain2-04",
            "src": "/assets/portfolio/Accessories/KeyChain2/z60FjZ8pX7W4gUhqHfrYJy03BETp8eNCP1nO0Nj9.webp",
            "alt": "KeyChain2 — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "sunglasses",
        "name": "Sunglasses",
        "images": [
          {
            "id": "accessories-sunglasses-01",
            "src": "/assets/portfolio/Accessories/Sunglasses/Gemini_Generated_Image_62yqbl62yqbl62yq.png",
            "alt": "Sunglasses — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-sunglasses-02",
            "src": "/assets/portfolio/Accessories/Sunglasses/Gemini_Generated_Image_a2nyd9a2nyd9a2ny.png",
            "alt": "Sunglasses — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-sunglasses-03",
            "src": "/assets/portfolio/Accessories/Sunglasses/Gemini_Generated_Image_kaycsxkaycsxkayc.png",
            "alt": "Sunglasses — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-sunglasses-04",
            "src": "/assets/portfolio/Accessories/Sunglasses/Gemini_Generated_Image_o5zoapo5zoapo5zo.png",
            "alt": "Sunglasses — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-sunglasses-05",
            "src": "/assets/portfolio/Accessories/Sunglasses/Gemini_Generated_Image_yob0lsyob0lsyob0.png",
            "alt": "Sunglasses — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "wallet",
        "name": "Wallet",
        "images": [
          {
            "id": "accessories-wallet-01",
            "src": "/assets/portfolio/Accessories/Wallet/61BygHH-M2L._AC_UY1000_.jpg",
            "alt": "Wallet — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-wallet-02",
            "src": "/assets/portfolio/Accessories/Wallet/Gemini_Generated_Image_cb75pmcb75pmcb75.png",
            "alt": "Wallet — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-wallet-03",
            "src": "/assets/portfolio/Accessories/Wallet/Gemini_Generated_Image_ma9u12ma9u12ma9u.png",
            "alt": "Wallet — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-wallet-04",
            "src": "/assets/portfolio/Accessories/Wallet/Gemini_Generated_Image_u2odrfu2odrfu2od.png",
            "alt": "Wallet — Accessories product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "accessories-wallet-05",
            "src": "/assets/portfolio/Accessories/Wallet/Gemini_Generated_Image_yq02u4yq02u4yq02.png",
            "alt": "Wallet — Accessories product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "cosmetics",
    "name": "Cosmetics",
    "subcategories": [
      {
        "id": "loreal",
        "name": "Loreal",
        "images": [
          {
            "id": "cosmetics-loreal-01",
            "src": "/assets/portfolio/Cosmetics/Loreal/61W9VkmjA1L._AC_SL1500_.jpg",
            "alt": "Loreal — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-loreal-02",
            "src": "/assets/portfolio/Cosmetics/Loreal/Gemini_Generated_Image_k20v34k20v34k20v.png",
            "alt": "Loreal — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-loreal-03",
            "src": "/assets/portfolio/Cosmetics/Loreal/Gemini_Generated_Image_xzgvtkxzgvtkxzgv.png",
            "alt": "Loreal — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-loreal-04",
            "src": "/assets/portfolio/Cosmetics/Loreal/Gemini_Generated_Image_y1p3bjy1p3bjy1p3.png",
            "alt": "Loreal — Cosmetics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "moistt-cream",
        "name": "Moistt Cream",
        "images": [
          {
            "id": "cosmetics-moistt-cream-01",
            "src": "/assets/portfolio/Cosmetics/Moistt%20Cream/Gemini_Generated_Image_9bi27s9bi27s9bi2.png",
            "alt": "Moistt Cream — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-moistt-cream-02",
            "src": "/assets/portfolio/Cosmetics/Moistt%20Cream/Gemini_Generated_Image_lipphmlipphmlipp.png",
            "alt": "Moistt Cream — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-moistt-cream-03",
            "src": "/assets/portfolio/Cosmetics/Moistt%20Cream/Gemini_Generated_Image_pg44iypg44iypg44.png",
            "alt": "Moistt Cream — Cosmetics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "nivea",
        "name": "Nivea",
        "images": [
          {
            "id": "cosmetics-nivea-01",
            "src": "/assets/portfolio/Cosmetics/Nivea/61OUIYhNYRL._AC_SL1500_.jpg",
            "alt": "Nivea — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-02",
            "src": "/assets/portfolio/Cosmetics/Nivea/Gemini_Generated_Image_7ojova7ojova7ojo%20(1).png",
            "alt": "Nivea — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-03",
            "src": "/assets/portfolio/Cosmetics/Nivea/Gemini_Generated_Image_7ojova7ojova7ojo.png",
            "alt": "Nivea — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-04",
            "src": "/assets/portfolio/Cosmetics/Nivea/Gemini_Generated_Image_oxzypcoxzypcoxzy.png",
            "alt": "Nivea — Cosmetics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "nivea-soft",
        "name": "Nivea soft",
        "images": [
          {
            "id": "cosmetics-nivea-soft-01",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/619X6L-mt3L._AC_SL1125_.jpg",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-soft-02",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/Gemini_Generated_Image_15w8qc15w8qc15w8.png",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-soft-03",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/Gemini_Generated_Image_8ci4p48ci4p48ci4.png",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-soft-04",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/Gemini_Generated_Image_ai965qai965qai96.png",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-soft-05",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/Gemini_Generated_Image_w54j20w54j20w54j.png",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-nivea-soft-06",
            "src": "/assets/portfolio/Cosmetics/Nivea%20soft/Gemini_Generated_Image_w59beiw59beiw59b.png",
            "alt": "Nivea soft — Cosmetics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "tretment",
        "name": "TretMent",
        "images": [
          {
            "id": "cosmetics-tretment-01",
            "src": "/assets/portfolio/Cosmetics/TretMent/Gemini_Generated_Image_ci3pvaci3pvaci3p.png",
            "alt": "TretMent — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-tretment-02",
            "src": "/assets/portfolio/Cosmetics/TretMent/Gemini_Generated_Image_pfbswrpfbswrpfbs.png",
            "alt": "TretMent — Cosmetics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "cosmetics-tretment-03",
            "src": "/assets/portfolio/Cosmetics/TretMent/Gemini_Generated_Image_uqnoinuqnoinuqno.png",
            "alt": "TretMent — Cosmetics product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "electronics",
    "name": "Electronics",
    "subcategories": [
      {
        "id": "case",
        "name": "Case",
        "images": [
          {
            "id": "electronics-case-01",
            "src": "/assets/portfolio/Electronics/Case/Gemini_Generated_Image_779rbo779rbo779r.png",
            "alt": "Case — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-case-02",
            "src": "/assets/portfolio/Electronics/Case/Gemini_Generated_Image_gvc3flgvc3flgvc3.png",
            "alt": "Case — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-case-03",
            "src": "/assets/portfolio/Electronics/Case/Gemini_Generated_Image_rq3hx1rq3hx1rq3h.png",
            "alt": "Case — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-case-04",
            "src": "/assets/portfolio/Electronics/Case/Gemini_Generated_Image_y32e65y32e65y32e.png",
            "alt": "Case — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-case-05",
            "src": "/assets/portfolio/Electronics/Case/covers%202.avif",
            "alt": "Case — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "headphone",
        "name": "Headphone",
        "images": [
          {
            "id": "electronics-headphone-01",
            "src": "/assets/portfolio/Electronics/Headphone/41JACWT-wWL._AC_SY450_.jpg",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-headphone-02",
            "src": "/assets/portfolio/Electronics/Headphone/Gemini_Generated_Image_cusrhbcusrhbcusr.png",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-headphone-03",
            "src": "/assets/portfolio/Electronics/Headphone/Gemini_Generated_Image_dcsdxidcsdxidcsd.png",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-headphone-04",
            "src": "/assets/portfolio/Electronics/Headphone/Gemini_Generated_Image_sjf1n5sjf1n5sjf1.png",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-headphone-05",
            "src": "/assets/portfolio/Electronics/Headphone/Gemini_Generated_Image_ukj4gkukj4gkukj4.png",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-headphone-06",
            "src": "/assets/portfolio/Electronics/Headphone/Gemini_Generated_Image_ylbxqiylbxqiylbx.png",
            "alt": "Headphone — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "laptop",
        "name": "Laptop",
        "images": [
          {
            "id": "electronics-laptop-01",
            "src": "/assets/portfolio/Electronics/Laptop/61R0dTkQSeL._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "Laptop — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-laptop-02",
            "src": "/assets/portfolio/Electronics/Laptop/Gemini_Generated_Image_3pne9h3pne9h3pne.png",
            "alt": "Laptop — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-laptop-03",
            "src": "/assets/portfolio/Electronics/Laptop/Gemini_Generated_Image_bkd5mlbkd5mlbkd5.png",
            "alt": "Laptop — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-laptop-04",
            "src": "/assets/portfolio/Electronics/Laptop/Gemini_Generated_Image_cszx6ycszx6ycszx.png",
            "alt": "Laptop — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-laptop-05",
            "src": "/assets/portfolio/Electronics/Laptop/Gemini_Generated_Image_vilvw9vilvw9vilv.png",
            "alt": "Laptop — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "pods",
        "name": "Pods",
        "images": [
          {
            "id": "electronics-pods-01",
            "src": "/assets/portfolio/Electronics/Pods/61RuDMWoDYL._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "Pods — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-pods-02",
            "src": "/assets/portfolio/Electronics/Pods/Gemini_Generated_Image_260z0p260z0p260z.png",
            "alt": "Pods — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-pods-03",
            "src": "/assets/portfolio/Electronics/Pods/Gemini_Generated_Image_atrkgiatrkgiatrk.png",
            "alt": "Pods — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-pods-04",
            "src": "/assets/portfolio/Electronics/Pods/Gemini_Generated_Image_j03h8tj03h8tj03h.png",
            "alt": "Pods — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "speaker",
        "name": "Speaker",
        "images": [
          {
            "id": "electronics-speaker-01",
            "src": "/assets/portfolio/Electronics/Speaker/71hacRj5-QL._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "Speaker — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-speaker-02",
            "src": "/assets/portfolio/Electronics/Speaker/Gemini_Generated_Image_qnxcudqnxcudqnxc.png",
            "alt": "Speaker — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "watch",
        "name": "watch",
        "images": [
          {
            "id": "electronics-watch-01",
            "src": "/assets/portfolio/Electronics/watch/61shUuiQKiL._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "watch — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-watch-02",
            "src": "/assets/portfolio/Electronics/watch/Gemini_Generated_Image_fctrjofctrjofctr.png",
            "alt": "watch — Electronics product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "electronics-watch-03",
            "src": "/assets/portfolio/Electronics/watch/Gemini_Generated_Image_yjgymxyjgymxyjgy.png",
            "alt": "watch — Electronics product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "fashion",
    "name": "Fashion",
    "subcategories": [
      {
        "id": "men-s-hoodie",
        "name": "Men's Hoodie",
        "images": [
          {
            "id": "fashion-men-s-hoodie-01",
            "src": "/assets/portfolio/Fashion/Men's%20Hoodie/013-Free-Simple-Hoodie-Mockup.webp",
            "alt": "Men's Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-hoodie-02",
            "src": "/assets/portfolio/Fashion/Men's%20Hoodie/Gemini_Generated_Image_4m7e984m7e984m7e.png",
            "alt": "Men's Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-hoodie-03",
            "src": "/assets/portfolio/Fashion/Men's%20Hoodie/Gemini_Generated_Image_ak4as9ak4as9ak4a.png",
            "alt": "Men's Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-hoodie-04",
            "src": "/assets/portfolio/Fashion/Men's%20Hoodie/Gemini_Generated_Image_l7ecxdl7ecxdl7ec.png",
            "alt": "Men's Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-hoodie-05",
            "src": "/assets/portfolio/Fashion/Men's%20Hoodie/Gemini_Generated_Image_xfed1xxfed1xxfed.png",
            "alt": "Men's Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "men-s-sport-suit",
        "name": "Men's Sport Suit",
        "images": [
          {
            "id": "fashion-men-s-sport-suit-01",
            "src": "/assets/portfolio/Fashion/Men's%20Sport%20Suit/71jOgKrlPDL._AC_SX569_.jpg",
            "alt": "Men's Sport Suit — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-sport-suit-02",
            "src": "/assets/portfolio/Fashion/Men's%20Sport%20Suit/Gemini_Generated_Image_ic1fxtic1fxtic1f.png",
            "alt": "Men's Sport Suit — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-sport-suit-03",
            "src": "/assets/portfolio/Fashion/Men's%20Sport%20Suit/Gemini_Generated_Image_k0jj1ok0jj1ok0jj.png",
            "alt": "Men's Sport Suit — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-sport-suit-04",
            "src": "/assets/portfolio/Fashion/Men's%20Sport%20Suit/Gemini_Generated_Image_vc8ihnvc8ihnvc8i.png",
            "alt": "Men's Sport Suit — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "men-s-tanktop",
        "name": "Men's TankTop",
        "images": [
          {
            "id": "fashion-men-s-tanktop-01",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Gemini_Generated_Image_1rmujz1rmujz1rmu.png",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-tanktop-02",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Gemini_Generated_Image_41ms2h41ms2h41ms.png",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-tanktop-03",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Gemini_Generated_Image_9kulq29kulq29kul.png",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-tanktop-04",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Gemini_Generated_Image_fo7rxlfo7rxlfo7r.png",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-tanktop-05",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Gemini_Generated_Image_tn2mvvtn2mvvtn2m.png",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-men-s-tanktop-06",
            "src": "/assets/portfolio/Fashion/Men's%20TankTop/Tank-Top-Mockup-3.jpg",
            "alt": "Men's TankTop — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "pink-hoodie",
        "name": "Pink Hoodie",
        "images": [
          {
            "id": "fashion-pink-hoodie-01",
            "src": "/assets/portfolio/Fashion/Pink%20Hoodie/7-70_800x.webp",
            "alt": "Pink Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-pink-hoodie-02",
            "src": "/assets/portfolio/Fashion/Pink%20Hoodie/Gemini_Generated_Image_2ocec72ocec72oce.png",
            "alt": "Pink Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-pink-hoodie-03",
            "src": "/assets/portfolio/Fashion/Pink%20Hoodie/Gemini_Generated_Image_6cee7k6cee7k6cee.png",
            "alt": "Pink Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-pink-hoodie-04",
            "src": "/assets/portfolio/Fashion/Pink%20Hoodie/Gemini_Generated_Image_sh3hr5sh3hr5sh3h.png",
            "alt": "Pink Hoodie — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "sneakers",
        "name": "Sneakers",
        "images": [
          {
            "id": "fashion-sneakers-01",
            "src": "/assets/portfolio/Fashion/Sneakers/Gemini_Generated_Image_2cikaw2cikaw2cik.png",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-sneakers-02",
            "src": "/assets/portfolio/Fashion/Sneakers/Gemini_Generated_Image_et2pr0et2pr0et2p.png",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-sneakers-03",
            "src": "/assets/portfolio/Fashion/Sneakers/Gemini_Generated_Image_fd8k8cfd8k8cfd8k.png",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-sneakers-04",
            "src": "/assets/portfolio/Fashion/Sneakers/Gemini_Generated_Image_fkjjjgfkjjjgfkjj.png",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-sneakers-05",
            "src": "/assets/portfolio/Fashion/Sneakers/Gemini_Generated_Image_lzdcwolzdcwolzdc.png",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-sneakers-06",
            "src": "/assets/portfolio/Fashion/Sneakers/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTEyL3JtNjA3LXNjZW5zZS1icGgtMDMtMDMtbW9ja3VwXzEuanBn.jpg",
            "alt": "Sneakers — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "women-s-pants",
        "name": "Women's Pants",
        "images": [
          {
            "id": "fashion-women-s-pants-01",
            "src": "/assets/portfolio/Fashion/Women's%20Pants/1_2114e470-c212-441b-8bcd-b8d2e9da74fb.webp",
            "alt": "Women's Pants — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-pants-02",
            "src": "/assets/portfolio/Fashion/Women's%20Pants/Gemini_Generated_Image_k8s6vik8s6vik8s6.png",
            "alt": "Women's Pants — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-pants-03",
            "src": "/assets/portfolio/Fashion/Women's%20Pants/Gemini_Generated_Image_w4518lw4518lw451.png",
            "alt": "Women's Pants — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-pants-04",
            "src": "/assets/portfolio/Fashion/Women's%20Pants/Gemini_Generated_Image_z7ijawz7ijawz7ij.png",
            "alt": "Women's Pants — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "women-s-shoe",
        "name": "Women's Shoe",
        "images": [
          {
            "id": "fashion-women-s-shoe-01",
            "src": "/assets/portfolio/Fashion/Women's%20Shoe/27081208_32.jpg",
            "alt": "Women's Shoe — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-shoe-02",
            "src": "/assets/portfolio/Fashion/Women's%20Shoe/Gemini_Generated_Image_5govdg5govdg5gov.png",
            "alt": "Women's Shoe — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-shoe-03",
            "src": "/assets/portfolio/Fashion/Women's%20Shoe/Gemini_Generated_Image_ugyrgeugyrgeugyr.png",
            "alt": "Women's Shoe — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-shoe-04",
            "src": "/assets/portfolio/Fashion/Women's%20Shoe/Gemini_Generated_Image_uj7pq7uj7pq7uj7p.png",
            "alt": "Women's Shoe — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-shoe-05",
            "src": "/assets/portfolio/Fashion/Women's%20Shoe/Gemini_Generated_Image_wtfcw1wtfcw1wtfc.png",
            "alt": "Women's Shoe — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "women-s-top",
        "name": "Women's Top",
        "images": [
          {
            "id": "fashion-women-s-top-01",
            "src": "/assets/portfolio/Fashion/Women's%20Top/4_tank-top-mockups.jpg",
            "alt": "Women's Top — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-top-02",
            "src": "/assets/portfolio/Fashion/Women's%20Top/Gemini_Generated_Image_ex9ucwex9ucwex9u.png",
            "alt": "Women's Top — Fashion product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "fashion-women-s-top-03",
            "src": "/assets/portfolio/Fashion/Women's%20Top/Gemini_Generated_Image_sjqnfusjqnfusjqn.png",
            "alt": "Women's Top — Fashion product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "home",
    "name": "Home",
    "subcategories": [
      {
        "id": "chair",
        "name": "Chair",
        "images": [
          {
            "id": "home-chair-01",
            "src": "/assets/portfolio/Home/Chair/Gemini_Generated_Image_o2o974o2o974o2o9.png",
            "alt": "Chair — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-chair-02",
            "src": "/assets/portfolio/Home/Chair/Gemini_Generated_Image_tkr9l4tkr9l4tkr9.png",
            "alt": "Chair — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-chair-03",
            "src": "/assets/portfolio/Home/Chair/Gemini_Generated_Image_utsfusutsfusutsf.png",
            "alt": "Chair — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "iron",
        "name": "Iron",
        "images": [
          {
            "id": "home-iron-01",
            "src": "/assets/portfolio/Home/Iron/Gemini_Generated_Image_a08g2za08g2za08g.png",
            "alt": "Iron — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-iron-02",
            "src": "/assets/portfolio/Home/Iron/Gemini_Generated_Image_euozfieuozfieuoz.png",
            "alt": "Iron — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-iron-03",
            "src": "/assets/portfolio/Home/Iron/Gemini_Generated_Image_ivupxlivupxlivup.png",
            "alt": "Iron — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "microwave",
        "name": "Microwave",
        "images": [
          {
            "id": "home-microwave-01",
            "src": "/assets/portfolio/Home/Microwave/Gemini_Generated_Image_4lglzq4lglzq4lgl.png",
            "alt": "Microwave — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-microwave-02",
            "src": "/assets/portfolio/Home/Microwave/Gemini_Generated_Image_gwwudggwwudggwwu.png",
            "alt": "Microwave — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-microwave-03",
            "src": "/assets/portfolio/Home/Microwave/Gemini_Generated_Image_xrqoaexrqoaexrqo.png",
            "alt": "Microwave — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "shrshoba",
        "name": "Shrshoba",
        "images": [
          {
            "id": "home-shrshoba-01",
            "src": "/assets/portfolio/Home/Shrshoba/61s3qUOBn-L._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "Shrshoba — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-shrshoba-02",
            "src": "/assets/portfolio/Home/Shrshoba/Gemini_Generated_Image_2p3kvo2p3kvo2p3k.png",
            "alt": "Shrshoba — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-shrshoba-03",
            "src": "/assets/portfolio/Home/Shrshoba/Gemini_Generated_Image_okt3pbokt3pbokt3.png",
            "alt": "Shrshoba — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "sofa",
        "name": "Sofa",
        "images": [
          {
            "id": "home-sofa-01",
            "src": "/assets/portfolio/Home/Sofa/Gemini_Generated_Image_3pm7uh3pm7uh3pm7.png",
            "alt": "Sofa — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-sofa-02",
            "src": "/assets/portfolio/Home/Sofa/Gemini_Generated_Image_ek3gorek3gorek3g.png",
            "alt": "Sofa — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-sofa-03",
            "src": "/assets/portfolio/Home/Sofa/Gemini_Generated_Image_sar9xgsar9xgsar9.png",
            "alt": "Sofa — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "cookware",
        "name": "cookware",
        "images": [
          {
            "id": "home-cookware-01",
            "src": "/assets/portfolio/Home/cookware/Gemini_Generated_Image_5d0wwd5d0wwd5d0w.png",
            "alt": "cookware — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-cookware-02",
            "src": "/assets/portfolio/Home/cookware/Gemini_Generated_Image_8xq7al8xq7al8xq7.png",
            "alt": "cookware — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-cookware-03",
            "src": "/assets/portfolio/Home/cookware/Gemini_Generated_Image_bz86aabz86aabz86.png",
            "alt": "cookware — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "fan",
        "name": "fan",
        "images": [
          {
            "id": "home-fan-01",
            "src": "/assets/portfolio/Home/fan/81uzvhL%2BlaL._AC_SY300_SX300_QL70_ML2_.jpg",
            "alt": "fan — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-fan-02",
            "src": "/assets/portfolio/Home/fan/Gemini_Generated_Image_67qli867qli867ql.png",
            "alt": "fan — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-fan-03",
            "src": "/assets/portfolio/Home/fan/Gemini_Generated_Image_rnw30ornw30ornw3.png",
            "alt": "fan — Home product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "home-fan-04",
            "src": "/assets/portfolio/Home/fan/Gemini_Generated_Image_ukd4mgukd4mgukd4.png",
            "alt": "fan — Home product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "jewellries",
    "name": "Jewellries",
    "subcategories": [
      {
        "id": "anklet",
        "name": "Anklet",
        "images": [
          {
            "id": "jewellries-anklet-01",
            "src": "/assets/portfolio/Jewellries/Anklet/Gemini_Generated_Image_5npddy5npddy5npd.png",
            "alt": "Anklet — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-anklet-02",
            "src": "/assets/portfolio/Jewellries/Anklet/Gemini_Generated_Image_5qwlol5qwlol5qwl.png",
            "alt": "Anklet — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-anklet-03",
            "src": "/assets/portfolio/Jewellries/Anklet/Gemini_Generated_Image_oumv3goumv3goumv.png",
            "alt": "Anklet — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-anklet-04",
            "src": "/assets/portfolio/Jewellries/Anklet/Gemini_Generated_Image_ub6ms2ub6ms2ub6m.png",
            "alt": "Anklet — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-anklet-05",
            "src": "/assets/portfolio/Jewellries/Anklet/pngtree-golden-anklet-charms-png-image_16165412.png",
            "alt": "Anklet — Jewellries product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "earrings",
        "name": "Earrings",
        "images": [
          {
            "id": "jewellries-earrings-01",
            "src": "/assets/portfolio/Jewellries/Earrings/Gemini_Generated_Image_3y1eni3y1eni3y1e.png",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-earrings-02",
            "src": "/assets/portfolio/Jewellries/Earrings/Gemini_Generated_Image_4xdetj4xdetj4xde.png",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-earrings-03",
            "src": "/assets/portfolio/Jewellries/Earrings/Gemini_Generated_Image_5pvgbb5pvgbb5pvg.png",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-earrings-04",
            "src": "/assets/portfolio/Jewellries/Earrings/Gemini_Generated_Image_kgj5mskgj5mskgj5.png",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-earrings-05",
            "src": "/assets/portfolio/Jewellries/Earrings/Gemini_Generated_Image_qow3hjqow3hjqow3.png",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-earrings-06",
            "src": "/assets/portfolio/Jewellries/Earrings/yellow.avif",
            "alt": "Earrings — Jewellries product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "necklace",
        "name": "Necklace",
        "images": [
          {
            "id": "jewellries-necklace-01",
            "src": "/assets/portfolio/Jewellries/Necklace/Gemini_Generated_Image_2quyul2quyul2quy.png",
            "alt": "Necklace — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-necklace-02",
            "src": "/assets/portfolio/Jewellries/Necklace/Gemini_Generated_Image_a4fruia4fruia4fr.png",
            "alt": "Necklace — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-necklace-03",
            "src": "/assets/portfolio/Jewellries/Necklace/Gemini_Generated_Image_emzslaemzslaemzs.png",
            "alt": "Necklace — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-necklace-04",
            "src": "/assets/portfolio/Jewellries/Necklace/Gemini_Generated_Image_wym0jawym0jawym0.png",
            "alt": "Necklace — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-necklace-05",
            "src": "/assets/portfolio/Jewellries/Necklace/istockphoto-2165466501-612x612.webp",
            "alt": "Necklace — Jewellries product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "ring",
        "name": "Ring",
        "images": [
          {
            "id": "jewellries-ring-01",
            "src": "/assets/portfolio/Jewellries/Ring/Gemini_Generated_Image_9nr1m49nr1m49nr1.png",
            "alt": "Ring — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-ring-02",
            "src": "/assets/portfolio/Jewellries/Ring/Gemini_Generated_Image_asobk2asobk2asob.png",
            "alt": "Ring — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-ring-03",
            "src": "/assets/portfolio/Jewellries/Ring/Gemini_Generated_Image_fwq0dofwq0dofwq0.png",
            "alt": "Ring — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-ring-04",
            "src": "/assets/portfolio/Jewellries/Ring/Gemini_Generated_Image_klkdl3klkdl3klkd.png",
            "alt": "Ring — Jewellries product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "jewellries-ring-05",
            "src": "/assets/portfolio/Jewellries/Ring/adc9f279101c47deb35701f771433dcd.thumbnail.0000000000_1024x1024.webp",
            "alt": "Ring — Jewellries product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "office",
    "name": "Office",
    "subcategories": [
      {
        "id": "calculator",
        "name": "Calculator",
        "images": [
          {
            "id": "office-calculator-01",
            "src": "/assets/portfolio/Office/Calculator/514Kel0a1xL._AC_SL1000_.jpg",
            "alt": "Calculator — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-calculator-02",
            "src": "/assets/portfolio/Office/Calculator/Gemini_Generated_Image_3hrful3hrful3hrf.png",
            "alt": "Calculator — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-calculator-03",
            "src": "/assets/portfolio/Office/Calculator/Gemini_Generated_Image_l384mel384mel384.png",
            "alt": "Calculator — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-calculator-04",
            "src": "/assets/portfolio/Office/Calculator/Gemini_Generated_Image_rluyn0rluyn0rluy.png",
            "alt": "Calculator — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-calculator-05",
            "src": "/assets/portfolio/Office/Calculator/Gemini_Generated_Image_x7mxfpx7mxfpx7mx.png",
            "alt": "Calculator — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "colors",
        "name": "Colors",
        "images": [
          {
            "id": "office-colors-01",
            "src": "/assets/portfolio/Office/Colors/51MqxgkfkuL._AC_.jpg",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-colors-02",
            "src": "/assets/portfolio/Office/Colors/71hflp6hOCL._AC_SL1500_.jpg",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-colors-03",
            "src": "/assets/portfolio/Office/Colors/Gemini_Generated_Image_6mnt146mnt146mnt.png",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-colors-04",
            "src": "/assets/portfolio/Office/Colors/Gemini_Generated_Image_bboeigbboeigbboe.png",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-colors-05",
            "src": "/assets/portfolio/Office/Colors/Gemini_Generated_Image_dsm0w6dsm0w6dsm0.png",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-colors-06",
            "src": "/assets/portfolio/Office/Colors/Gemini_Generated_Image_i35bfmi35bfmi35b.png",
            "alt": "Colors — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "notebook",
        "name": "Notebook",
        "images": [
          {
            "id": "office-notebook-01",
            "src": "/assets/portfolio/Office/Notebook/511hrNb76GL._AC_SL1000_.jpg",
            "alt": "Notebook — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-notebook-02",
            "src": "/assets/portfolio/Office/Notebook/Gemini_Generated_Image_g63w0jg63w0jg63w.png",
            "alt": "Notebook — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-notebook-03",
            "src": "/assets/portfolio/Office/Notebook/Gemini_Generated_Image_lhmu24lhmu24lhmu.png",
            "alt": "Notebook — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-notebook-04",
            "src": "/assets/portfolio/Office/Notebook/Gemini_Generated_Image_npjywqnpjywqnpjy.png",
            "alt": "Notebook — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-notebook-05",
            "src": "/assets/portfolio/Office/Notebook/Gemini_Generated_Image_u3gzinu3gzinu3gz.png",
            "alt": "Notebook — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "pencil-sharpner",
        "name": "Pencil Sharpner",
        "images": [
          {
            "id": "office-pencil-sharpner-01",
            "src": "/assets/portfolio/Office/Pencil%20Sharpner/71TLmSZi9%2BL._AC_SL1500_.jpg",
            "alt": "Pencil Sharpner — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-pencil-sharpner-02",
            "src": "/assets/portfolio/Office/Pencil%20Sharpner/Gemini_Generated_Image_i42r67i42r67i42r.png",
            "alt": "Pencil Sharpner — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-pencil-sharpner-03",
            "src": "/assets/portfolio/Office/Pencil%20Sharpner/Gemini_Generated_Image_pq0ti4pq0ti4pq0t.png",
            "alt": "Pencil Sharpner — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-pencil-sharpner-04",
            "src": "/assets/portfolio/Office/Pencil%20Sharpner/Gemini_Generated_Image_scxxrdscxxrdscxx.png",
            "alt": "Pencil Sharpner — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "rotopen",
        "name": "RotoPen",
        "images": [
          {
            "id": "office-rotopen-01",
            "src": "/assets/portfolio/Office/RotoPen/31yqrMe7WZL._AC_.jpg",
            "alt": "RotoPen — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-rotopen-02",
            "src": "/assets/portfolio/Office/RotoPen/51fnFZctEFL._AC_SL1500_.jpg",
            "alt": "RotoPen — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-rotopen-03",
            "src": "/assets/portfolio/Office/RotoPen/Gemini_Generated_Image_5z2uzj5z2uzj5z2u.png",
            "alt": "RotoPen — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-rotopen-04",
            "src": "/assets/portfolio/Office/RotoPen/Gemini_Generated_Image_jnhs8sjnhs8sjnhs.png",
            "alt": "RotoPen — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "clay",
        "name": "clay",
        "images": [
          {
            "id": "office-clay-01",
            "src": "/assets/portfolio/Office/clay/61ALpb%2B1gWL._AC_SL1500_.jpg",
            "alt": "clay — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-clay-02",
            "src": "/assets/portfolio/Office/clay/61ed859BtJL._AC_SL1200_.jpg",
            "alt": "clay — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-clay-03",
            "src": "/assets/portfolio/Office/clay/Gemini_Generated_Image_enbwzxenbwzxenbw.png",
            "alt": "clay — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-clay-04",
            "src": "/assets/portfolio/Office/clay/Gemini_Generated_Image_f4b0pif4b0pif4b0.png",
            "alt": "clay — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-clay-05",
            "src": "/assets/portfolio/Office/clay/Gemini_Generated_Image_vocd3zvocd3zvocd.png",
            "alt": "clay — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "eraser",
        "name": "eraser",
        "images": [
          {
            "id": "office-eraser-01",
            "src": "/assets/portfolio/Office/eraser/31g%2BUr0EeNL._AC_.jpg",
            "alt": "eraser — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-eraser-02",
            "src": "/assets/portfolio/Office/eraser/Gemini_Generated_Image_1aadrw1aadrw1aad.png",
            "alt": "eraser — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-eraser-03",
            "src": "/assets/portfolio/Office/eraser/Gemini_Generated_Image_c0ky9rc0ky9rc0ky.png",
            "alt": "eraser — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-eraser-04",
            "src": "/assets/portfolio/Office/eraser/Gemini_Generated_Image_owgkzvowgkzvowgk.png",
            "alt": "eraser — Office product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "office-eraser-05",
            "src": "/assets/portfolio/Office/eraser/Gemini_Generated_Image_tpfdzvtpfdzvtpfd.png",
            "alt": "eraser — Office product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  },
  {
    "id": "toys",
    "name": "Toys",
    "subcategories": [
      {
        "id": "aircraft",
        "name": "Aircraft",
        "images": [
          {
            "id": "toys-aircraft-01",
            "src": "/assets/portfolio/Toys/Aircraft/49MYd.jpg",
            "alt": "Aircraft — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-aircraft-02",
            "src": "/assets/portfolio/Toys/Aircraft/Gemini_Generated_Image_qcdnacqcdnacqcdn.png",
            "alt": "Aircraft — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-aircraft-03",
            "src": "/assets/portfolio/Toys/Aircraft/Gemini_Generated_Image_qdz0oqqdz0oqqdz0.png",
            "alt": "Aircraft — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-aircraft-04",
            "src": "/assets/portfolio/Toys/Aircraft/Gemini_Generated_Image_rps0pqrps0pqrps0%20(1).png",
            "alt": "Aircraft — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-aircraft-05",
            "src": "/assets/portfolio/Toys/Aircraft/toys%202.jpg",
            "alt": "Aircraft — Toys product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "chess",
        "name": "Chess",
        "images": [
          {
            "id": "toys-chess-01",
            "src": "/assets/portfolio/Toys/Chess/Gemini_Generated_Image_7geqci7geqci7geq.png",
            "alt": "Chess — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-chess-02",
            "src": "/assets/portfolio/Toys/Chess/Gemini_Generated_Image_82wa8n82wa8n82wa.png",
            "alt": "Chess — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-chess-03",
            "src": "/assets/portfolio/Toys/Chess/Gemini_Generated_Image_jcsgcvjcsgcvjcsg.png",
            "alt": "Chess — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-chess-04",
            "src": "/assets/portfolio/Toys/Chess/Gemini_Generated_Image_wuzgzhwuzgzhwuzg.png",
            "alt": "Chess — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-chess-05",
            "src": "/assets/portfolio/Toys/Chess/toys%207.jpg",
            "alt": "Chess — Toys product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "motorcycle",
        "name": "Motorcycle",
        "images": [
          {
            "id": "toys-motorcycle-01",
            "src": "/assets/portfolio/Toys/Motorcycle/Gemini_Generated_Image_9bdyfn9bdyfn9bdy.png",
            "alt": "Motorcycle — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-motorcycle-02",
            "src": "/assets/portfolio/Toys/Motorcycle/Gemini_Generated_Image_d6310cd6310cd631.png",
            "alt": "Motorcycle — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-motorcycle-03",
            "src": "/assets/portfolio/Toys/Motorcycle/Gemini_Generated_Image_d6b7hid6b7hid6b7.png",
            "alt": "Motorcycle — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-motorcycle-04",
            "src": "/assets/portfolio/Toys/Motorcycle/Gemini_Generated_Image_nx8tejnx8tejnx8t.png",
            "alt": "Motorcycle — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-motorcycle-05",
            "src": "/assets/portfolio/Toys/Motorcycle/toys%203.jpg",
            "alt": "Motorcycle — Toys product photography",
            "width": 800,
            "height": 800
          }
        ]
      },
      {
        "id": "train",
        "name": "Train",
        "images": [
          {
            "id": "toys-train-01",
            "src": "/assets/portfolio/Toys/Train/Gemini_Generated_Image_cx9qhscx9qhscx9q.png",
            "alt": "Train — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-train-02",
            "src": "/assets/portfolio/Toys/Train/Gemini_Generated_Image_lp9k3nlp9k3nlp9k.png",
            "alt": "Train — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-train-03",
            "src": "/assets/portfolio/Toys/Train/Gemini_Generated_Image_myixgvmyixgvmyix.png",
            "alt": "Train — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-train-04",
            "src": "/assets/portfolio/Toys/Train/Gemini_Generated_Image_u64cdau64cdau64c.png",
            "alt": "Train — Toys product photography",
            "width": 800,
            "height": 800
          },
          {
            "id": "toys-train-05",
            "src": "/assets/portfolio/Toys/Train/toys%201.jpg",
            "alt": "Train — Toys product photography",
            "width": 800,
            "height": 800
          }
        ]
      }
    ]
  }
]
