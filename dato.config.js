const htmlTag = require('html-tag');
const dastRenderer = require('datocms-structured-text-to-html-string');
const { makeJQueryPlugin } = require('imagesloaded');

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

  var pages = ['home', 'pageAbout', 'pageTheme', 'pageCompany', 'pageContact'];

  var imageType = "png";
  var iconType = "svg";

  var lang = dato.site.locales[0];

  // Add to the existing Hugo config files some properties coming from data
  // stored on DatoCMS
  ['config.dev.toml', 'config.prod.toml'].forEach(file => {
    root.addToDataFile(file, 'toml', {
      title: dato.site.globalSeo.siteName,
      defaultcontentlanguage: "en",
      defaultcontentlang: "en",
      defaultcontentlanguageinsubdir: true,
      disableAliases: true
    });
  });

  // Create a YAML data file to store global data about the site
  root.createDataFile('data/settings.yml', 'yaml', {
    name: dato.site.globalSeo.siteName,
    description: dato.site.globalSeo.description,
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

  dato.site.locales.forEach((locale) => {
    pages.forEach((page, index) => {
      i18n.locale = locale;

      if (dato[page]) {
        var pageData = dato[page];



        console.log("Page: " + page)
        var filename = (page == "home" ? '_index.md' : pageData.slug + '/index.md');

        var frontmatter = {
          type: page,
          title: pageData.title,
          seoMetaTags: toHtml(pageData.seoMetaTags),
          menu: {
            main: {
              weight: (index + 1) * 100
            }
          },
          socialProfiles: dato.socialProfiles.map(profile => {
            return {
              type: profile.profileType.toLowerCase().replace(/ +/, '-'),
              url: profile.url,
            };
          })
        }

        addBanner(frontmatter, pageData);
        addDomains(frontmatter, pageData);
        addCompanies(frontmatter, pageData)
        addThemes(frontmatter, pageData);
        addContact(frontmatter, pageData);
        addValues(frontmatter, pageData);
        addAboutUs(frontmatter, pageData);

        addBlock(frontmatter, pageData, 'addedValue');
        addBlock(frontmatter, pageData, 'contactBlock');

        addFooterData(frontmatter, dato);
        addSlugs(frontmatter);

        root.createPost('content/' + locale + '/' + filename, 'yaml', {
          frontmatter: frontmatter
        });
      }
    });

  });

  function createIcon(icon) {
    if (icon) {
      return {
        src: icon.url({ w: 60, h: 60, fm: iconType }),
        alt: icon.alt
      }
    }
  }

  function createImage(image, width, height, format) {
    if (image) {
      return {
        src: image.url({ w: width * 2, h: height * 2, fm: format }),
        alt: image.alt
      }
    }
  }

  function addBanner(frontmatter, pageData) {
    if (pageData && pageData.header && pageData.header.length > 0) {
      var headerData = pageData.header[0];
      frontmatter.banner = {
        title: headerData.title,
        short: headerData.short,
        link: headerData.linkPage ? headerData.linkPage.slug : headerData.link,
        dark: headerData.dark,
        image: createImage(headerData.image, 544, 634, imageType),
        socialProfiles: dato.socialProfiles.map(profile => {
          return {
            type: profile.profileType.toLowerCase().replace(/ +/, '-'),
            url: profile.url,
          };
        }),
      }
    }
  }

  function addDomains(frontmatter, pageData) {
    if (pageData.domains) {
      frontmatter.domains = {
        title: pageData.domainsTitle,
        items: pageData.domains.map((item, index) => {
          return {
            title: item.title,
            short: dastRenderer.render(item.short),
            icon: createIcon(item.icon),
            weight: index,
            even: (index % 2 == 0)
          }
        })
      }
    }
  }

  function addCompanies(frontmatter, pageData) {
    if (pageData.companies) {
      frontmatter.companies = {
        title: pageData.companiesTitle,
        short: pageData.companiesShort,
        items: pageData.companies.map((item, index) => {
          return {
            name: item.name,
            short: item.short,
            long: item.long,
            roles: item.roles,
            url_website: item.urlWebsite,
            url_jobs: item.urlJobs,
            url_cases: item.urlCases,
            logo_color: createImage(item.logoColor, 168, 202, 'svg'),
            weight: index,
            even: (index % 2 == 0)
          }
        })
      }
    }
  }


  function addThemes(frontmatter, pageData) {
    if (pageData.themes) {
      frontmatter.themes = {
        title: pageData.themesTitle,
        items: pageData.themes.map((item, index) => {
          return {
            title: item.title,
            short: item.short,
            long: item.long,
            icon: createIcon(item.icon),
            image: createImage(item.image, 500, 500, imageType),
            weight: index,
            even: (index % 2 == 0)
          }
        })
      }
    }

  }


  function addValues(frontmatter, pageData) {
    if (pageData.values) {
      frontmatter.values = {
        title: pageData.valuesTitle,
        items: pageData.values.map((item, index) => {
          return {
            title: item.title,
            short: dastRenderer.render(item.short),
            icon: createIcon(item.icon),
            weight: index,
            even: (index % 2 == 0)
          }
        })
      }
    }
  }

  function addAboutUs(frontmatter, pageData) {
    if (pageData.aboutUsTitle) {
      frontmatter.aboutUs = {
        title: pageData.aboutUsTitle,
        content: dastRenderer.render(pageData.aboutUsContent)
      }
    }
  }

  function addBlock(frontmatter, pageData, field) {
    if (pageData[field] && pageData[field].length > 0) {
      frontmatter[field] = {
        title: pageData[field][0].title,
        short: dastRenderer.render(pageData[field][0].short),
        image: createImage(pageData[field][0].image, 500, 500, imageType),
        icon: createIcon(pageData[field][0].icon),
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
            url: company.urlWebsite,
            weight: (index + 1) * 100
          }
        })
      },
      themes: {
        title: dato.home.themesTitle,
        items: dato.home.themes.map((item, index) => {
          return {
            title: item.title,
            url: '/' + dato.pageTheme.slug,
            weight: (index + 1) * 100
          }
        })
      }
    }
  }

  function addSlugs(frontmatter) {
    frontmatter.slugs = {};
    pages.forEach((page) => {
      frontmatter.slugs[page] = dato[page].slug;
    })
  }
}