const htmlTag = require('html-tag');
const dastRenderer = require('datocms-structured-text-to-html-string');

// This function helps transforming structures like:
//
// [{ tagName: 'meta', attributes: { name: 'description', content: 'foobar' } }]
//
// into proper HTML tags:
//
// <meta name="description" content="foobar" />

const toHtml = (tags) => {
  if (tags) {
    return tags.map(({ tagName, attributes, content }) => (
      htmlTag(tagName, attributes, content)
    )).join("")
  } else {
    return ""
  }
};

// Arguments that will receive the mapping function:
//
// * dato: lets you easily access any content stored in your DatoCMS
//   administrative area;
//
// * root: represents the root of your project, and exposes commands to
//   easily create local files/directories;
//
// * i18n: allows to switch the current locale to get back content in
//   alternative locales from the first argument.
//
// Read all the details here:
// https://github.com/datocms/js-datocms-client/blob/master/docs/dato-cli.md

module.exports = (dato, root, i18n) => {

  var pages = [ 'home', 'pageAbout', 'pageTheme', 'pageCompany', 'pageContact'];

  // Add to the existing Hugo config files some properties coming from data
  // stored on DatoCMS
  ['config.dev.toml', 'config.prod.toml'].forEach(file => {
    root.addToDataFile(file, 'toml', {
      title: dato.site.globalSeo.siteName,
      languageCode: i18n.locale
    });
  });

  // Create a YAML data file to store global data about the site
  root.createDataFile('data/settings.yml', 'yaml', {
    name: dato.site.globalSeo.siteName,
    description: dato.site.globalSeo.description,
    language: dato.site.locales[0],
    // iterate over all the `social_profile` item types
    socialProfiles: dato.socialProfiles.map(profile => {
      return {
        type: profile.profileType.toLowerCase().replace(/ +/, '-'),
        url: profile.url,
      };
    }),
    faviconMetaTags: toHtml(dato.site.faviconMetaTags),
    seoMetaTags: toHtml(dato.home.seoMetaTags)

   
  });


  var siteData = dato.site.toMap()

 

  // TODO abstract path 



  
  pages.forEach((page, index) => {
      if (dato[page]) {
        var pageData = dato[page];
        
        var filename = (page == "home" ? '_index.md' : pageData.slug + '/index.md');

        var frontmatter ={
          type: page,
          title: pageData.title,
          seoMetaTags: toHtml(pageData.seoMetaTags),
          menu: {
            main: {
              weight: (index+1)*100
            }
          }
        }

        addBanner(frontmatter, pageData);
        addDomains(frontmatter, pageData);
        addCompanies(frontmatter, pageData)
        addThemes(frontmatter, pageData);
        addContact(frontmatter, pageData);
        addValues(frontmatter, pageData);

        addBlock(frontmatter, pageData, 'addedValue');
        addBlock(frontmatter, pageData, 'contactBlock');


        addFooterData(frontmatter, dato)



        root.createPost('content/' + filename, 'yaml', {
          frontmatter: frontmatter
        });
        
        


      }
  });

  
function addBanner(frontmatter, pageData) {
  if (pageData && pageData.header && pageData.header.length > 0  ) {
    var headerData = pageData.header[0];
    frontmatter.banner = {
      title: headerData.title,
      short: headerData.short,
      link: headerData.link,
      dark: headerData.dark,
      image: headerData.image
    }
  }
}  

function addDomains(frontmatter, pageData) {
  if(pageData.domains) {
    frontmatter.domains = {
      title: pageData.domainsTitle,
      items: pageData.domains.map((item, index) => { return {
        title: item.title,
        short: item.short,
        icon: item.icon,
        weight: index,
        even: (index % 2 == 0)
      }})
    }    
  }
}

function addCompanies(frontmatter, pageData) {
  if (pageData.companies) {
    frontmatter.companies = {
      title:pageData.companiesTitle,
      short:pageData.companiesShort,
      items: pageData.companies.map((item, index) => {
        return {
          name: item.name,
          short: item.short,
          long: item.long,
          url_website: item.url_website,
          url_jobs: item.url_jobs,
          url_cases: item.url_cases,
          weight: index,
          even: (index % 2 == 0)
        }
      })
    }
  }
}

function addThemes(frontmatter, pageData) {
  if(pageData.themes) {
    frontmatter.themes = {
      title: pageData.themesTitle,
      items: pageData.themes.map((item, index) => { return {
        title: item.title,
        short: item.short,
        long: item.long,
        icon: item.icon,
        image: item.image,
        weight: index,
        even: (index % 2 == 0)
      }})
    }    
  }

}


function addValues(frontmatter, pageData) {
  if(pageData.values) {
    frontmatter.values = {
      title: pageData.valuesTitle,
      items: pageData.values.map((item, index) => { return {
        title: item.title,
        short: item.short,
        icon: item.icon,
        weight: index,
        even: (index % 2 == 0)
      }})
    }    
  }
}

function addBlock(frontmatter, pageData, field) {
  if (pageData[field] && pageData[field].length > 0) {
    frontmatter[field] = {
      title: pageData[field][0].title,
      short: dastRenderer.render(pageData[field][0].short),
      image: pageData[field][0].image
    };

  }
}


function addContact(frontmatter, pageData) {
  if (pageData && pageData.contact && pageData.contact.length > 0) {
    var contactData = pageData.contact[0];
    frontmatter.contact = {
      title: contactData.title,
      short: dastRenderer.render(contactData.short),
    }
  }
}  

function addFooterData(frontmatter, dato) {
  frontmatter.footer = {
    companies: {
      title: dato.home.companiesTitle,
      items: dato.home.companies.map((company, index) => {
        return { 
          name: company.name, 
          url: company.website_url,
          weight: (index+1) * 100 
        }
      })
    },
    themes: {
      title: dato.home.themesTitle,
      items: dato.home.themes.map((item, index) => { return {
        title: item.title,
        url: dato.pageTheme.slug + '#' + item.slug,
        weight: (index+1) * 100 
      }})
    }
  }
}
};


