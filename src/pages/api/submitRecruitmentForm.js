const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

export default async function submitToGoogleSheet(req, res) {
  const auth = new GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const {
    fullname, email, phoneno, dob, course, branch, semester, usn, aboutYourself, ahaMoment, collabQuestion, whyVolunteer, experience, teamSelection,
    proficiencyCreativeWriting,creativeWriting, creativeWritingCaptions, tedxThemeSuggestions, movieImpact, contentFormats, philosophicalThought, workLinks,
    proficiencyWebsiteDesign, extremePressureExperience, workflow, platformsUsed, avSetupExperience, proficiencyGoogleApps, portfolioLinks,problemCommunication
    ,innovativeIdea, proficiencySkills, proficiencySoundTools, strategies,latestTrends,inspiration,exampleMarketing,pitchSponsor,keyElements,briefSpeech,socialLinks,technologyImplementation, supportStageFright, handleDisagreement,
    successfulEvent, eventVolunteerDuties, standOutFromOthers, excitementAboutRole,
  } = req.body;

  let values = [
    fullname, email, phoneno, dob, course, branch, semester, usn, aboutYourself, ahaMoment, collabQuestion, whyVolunteer, experience
  ];

  if (teamSelection === 'Curation Team') {
    values = values.concat([proficiencyCreativeWriting, creativeWriting, creativeWritingCaptions, tedxThemeSuggestions, movieImpact, contentFormats, philosophicalThought, workLinks]);
  } else if (teamSelection === 'Technical Team') {
    values = values.concat([proficiencyWebsiteDesign, extremePressureExperience, workflow, platformsUsed, avSetupExperience, proficiencyGoogleApps, portfolioLinks,problemCommunication,innovativeIdea]);
  } else if (teamSelection === 'Creative Team') {
    values = values.concat([JSON.stringify(proficiencySkills), JSON.stringify(proficiencySoundTools)],strategies,latestTrends, inspiration,workLinks);
  } else if (teamSelection === 'Sponsorship Team') {
    values = values.concat([exampleMarketing,pitchSponsor,keyElements,briefSpeech,socialLinks]);
  } else if (teamSelection === 'Event Management Team') {
    values = values.concat([technologyImplementation, supportStageFright, handleDisagreement, successfulEvent, eventVolunteerDuties, standOutFromOthers, excitementAboutRole]);
  }

  const spreadsheetIds = [
    process.env.NEXT_PUBLIC_GOOGLE_RECRUITMENT_SHEET_ID_1,
    process.env.NEXT_PUBLIC_GOOGLE_RECRUITMENT_SHEET_ID_2,
  ];

  const range = `${teamSelection}!B:B`; 

  try {
    const existingEmailsPromises = spreadsheetIds.map(spreadsheetId => {
      return sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    });

    const existingEmailsResults = await Promise.all(existingEmailsPromises);

    const existingEmails = existingEmailsResults.reduce((acc, result) => {
      if (result.data.values) {
        acc = acc.concat(result.data.values.flat());
      }
      return acc;
    }, []);

    const emailCount = existingEmails.filter(existingEmail => existingEmail === email).length;

    //  Check if the email has already been submitted more than 2 times
    if (emailCount > 2) {
      return res.status(400).send('You have already applied more than twice. No more submissions are allowed.');
    }

    const requests = spreadsheetIds.map(spreadsheetId => ({
      spreadsheetId,
      range: `${teamSelection}!A1`, 
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values],
      },
    }));

    await Promise.all(requests.map(request => {
      return sheets.spreadsheets.values.append(request);
    }));

    res.status(200).send('Form successfully submitted!');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error submitting form data');
  }
}
