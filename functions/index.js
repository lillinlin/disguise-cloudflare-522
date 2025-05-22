export async function onRequest(context) {
  const assetResponse = await context.env.ASSETS.fetch(context.request);
  if (assetResponse.status !== 200) {
    return new Response("Error loading 522 page content asset", { status: assetResponse.status });
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;

  const userIp = context.request.headers.get('CF-Connecting-IP') || 'N/A';
  const requestedHost = context.request.headers.get('Host') || 'N/A';
  const cfRay = context.request.headers.get('cf-ray');
  const rayId = cfRay || 'N/A';

  // 获取城市名的映射表
  const cityMapping = {
    "San Jose": "San Jose",
    "Seattle": "Seattle",
    "Tokyo": "Tokyo",
    "London": "London",
    "Los Angeles": "Los Angeles",
    "Ashburn": "Ashburn",
    "Hong Kong": "Hong Kong",
    "Frankfurt": "Frankfurt",
    "Dallas": "Dallas",
    "Amsterdam": "Amsterdam",
    "Chicago": "Chicago",
    "Newark": "Newark",
    "Atlanta": "Atlanta",
    "Stockholm": "Stockholm",
    "Paris": "Paris",
    "Oklahoma City": "Oklahoma City",
    "Boston": "Boston",
    "Portland": "Portland",
    "Osaka": "Osaka",
    "Miami": "Miami",
    "Madrid": "Madrid",
    "Singapore": "Singapore",
    "Sydney": "Sydney",
    "São Paulo": "São Paulo",
    "Buffalo": "Buffalo",
    "Denver": "Denver",
    "Indianapolis": "Indianapolis",
    "Houston": "Houston",
    "Richmond": "Richmond",
    "Salt Lake City": "Salt Lake City",
    "Honolulu": "Honolulu",
    "Vancouver": "Vancouver",
    "Marseille": "Marseille",
    "Mumbai": "Mumbai",
    "Calgary": "Calgary",
    "Minneapolis": "Minneapolis",
    "Querétaro": "Querétaro",
    "Memphis": "Memphis",
    "Norfolk": "Norfolk",
    "San Diego": "San Diego",
    "Detroit": "Detroit",
    "Kansas City": "Kansas City",
    "Toronto": "Toronto",
    "Tallahassee": "Tallahassee",
    "Montreal": "Montreal",
    "Zurich": "Zurich",
    "Lanzhou": "Lanzhou",
    "Halifax": "Halifax",
    "Seoul": "Seoul",
    "Phoenix": "Phoenix",
    "Columbus": "Columbus",
    "Durham": "Durham",
    "Dublin": "Dublin",
    "Taipei": "Taipei",
    "Milan": "Milan",
    "Düsseldorf": "Düsseldorf",
    "Kuala Lumpur": "Kuala Lumpur",
    "Albuquerque": "Albuquerque",
    "Lisbon": "Lisbon",
    "Fukuoka": "Fukuoka",
    "Moscow": "Moscow",
    "Riyadh": "Riyadh",
    "Mexico City": "Mexico City"
  };

  // 获取用户的城市信息，默认值为 'Unknown Location'
  const userCity = context.request.cf && context.request.cf.city 
    ? cityMapping[context.request.cf.city] || context.request.cf.city 
    : 'Los Angeles';

  const rewriter = new HTMLRewriter()
    .on('header div.mt-3', {
      element(element) {
        element.setInnerContent(formattedTime);
      }
    })
    .on('#cf-cloudflare-status span.md\\:block', {
      element(element) {
        element.setInnerContent(userCity);
      }
    })
    .on('#cf-host-status span.md\\:block', {
      element(element) {
        element.setInnerContent(requestedHost);
      }
    })
    .on('.cf-error-footer strong', {
       element(element) {
         element.setInnerContent(rayId);
       }
    })
    .on('span#cf-footer-ip', {
      element(element) {
         element.setInnerContent(userIp);
      }
    })
    .on('head title', {
        text(text) {
            const originalTitle = text.text;
            const parts = originalTitle.split('| 522:');
            if (parts.length > 1) {
                 text.replace(`${requestedHost} | 522:${parts[1]}`);
             } else {
                 text.replace(`${requestedHost} | 522: Connection timed out`);
             }
        }
    });

  return new Response(await rewriter.transform(assetResponse).text(), {
    status: 522,
    headers: {
      'content-type': assetResponse.headers.get('content-type') || 'text/html;charset=UTF-8',
    },
  });
}
