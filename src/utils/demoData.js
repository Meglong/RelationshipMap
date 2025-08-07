const User = require('../models/User');
const Relationship = require('../models/Relationship');
const Interaction = require('../models/Interaction');

const demoUsers = [
  {
    slackUserId: 'U1234567890',
    slackTeamId: 'T1234567890',
    email: 'john.doe@company.com',
    displayName: 'John Doe',
    realName: 'John Doe',
    profile: {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      interests: ['coding', 'hiking', 'photography', 'machine learning'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4567',
      skype: 'john.doe'
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567891',
    slackTeamId: 'T1234567890',
    email: 'sarah.smith@company.com',
    displayName: 'Sarah Smith',
    realName: 'Sarah Smith',
    profile: {
      title: 'Product Manager',
      department: 'Product',
      interests: ['product strategy', 'user research', 'coffee', 'data analysis'],
      status: 'In a meeting',
      statusEmoji: ':meeting:',
      phone: '+1 (555) 123-4568',
      skype: 'sarah.smith'
    },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567892',
    slackTeamId: 'T1234567890',
    email: 'mike.johnson@company.com',
    displayName: 'Mike Johnson',
    realName: 'Mike Johnson',
    profile: {
      title: 'UX Designer',
      department: 'Design',
      interests: ['design systems', 'sketching', 'travel', 'user experience'],
      status: 'Working from home',
      statusEmoji: ':house:',
      phone: '+1 (555) 123-4569',
      skype: 'mike.johnson'
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567893',
    slackTeamId: 'T1234567890',
    email: 'lisa.wang@company.com',
    displayName: 'Lisa Wang',
    realName: 'Lisa Wang',
    profile: {
      title: 'Data Scientist',
      department: 'Data',
      interests: ['machine learning', 'python', 'yoga', 'statistics'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4570',
      skype: 'lisa.wang'
    },
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567894',
    slackTeamId: 'T1234567890',
    email: 'david.brown@company.com',
    displayName: 'David Brown',
    realName: 'David Brown',
    profile: {
      title: 'Engineering Manager',
      department: 'Engineering',
      interests: ['leadership', 'mentoring', 'golf', 'team building'],
      status: 'In a meeting',
      statusEmoji: ':meeting:',
      phone: '+1 (555) 123-4571',
      skype: 'david.brown'
    },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    isAdmin: true,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567895',
    slackTeamId: 'T1234567890',
    email: 'emma.wilson@company.com',
    displayName: 'Emma Wilson',
    realName: 'Emma Wilson',
    profile: {
      title: 'Frontend Developer',
      department: 'Engineering',
      interests: ['react', 'typescript', 'accessibility', 'coffee'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4572',
      skype: 'emma.wilson'
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567896',
    slackTeamId: 'T1234567890',
    email: 'alex.chen@company.com',
    displayName: 'Alex Chen',
    realName: 'Alex Chen',
    profile: {
      title: 'Backend Developer',
      department: 'Engineering',
      interests: ['node.js', 'databases', 'system design', 'gaming'],
      status: 'Working from home',
      statusEmoji: ':house:',
      phone: '+1 (555) 123-4573',
      skype: 'alex.chen'
    },
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567897',
    slackTeamId: 'T1234567890',
    email: 'maria.garcia@company.com',
    displayName: 'Maria Garcia',
    realName: 'Maria Garcia',
    profile: {
      title: 'Marketing Manager',
      department: 'Marketing',
      interests: ['digital marketing', 'social media', 'content creation', 'analytics'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4574',
      skype: 'maria.garcia'
    },
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567898',
    slackTeamId: 'T1234567890',
    email: 'james.taylor@company.com',
    displayName: 'James Taylor',
    realName: 'James Taylor',
    profile: {
      title: 'DevOps Engineer',
      department: 'Engineering',
      interests: ['kubernetes', 'docker', 'aws', 'automation'],
      status: 'In a meeting',
      statusEmoji: ':meeting:',
      phone: '+1 (555) 123-4575',
      skype: 'james.taylor'
    },
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567899',
    slackTeamId: 'T1234567890',
    email: 'sophie.anderson@company.com',
    displayName: 'Sophie Anderson',
    realName: 'Sophie Anderson',
    profile: {
      title: 'QA Engineer',
      department: 'Engineering',
      interests: ['testing', 'automation', 'quality assurance', 'coffee'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4576',
      skype: 'sophie.anderson'
    },
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567900',
    slackTeamId: 'T1234567890',
    email: 'robert.lee@company.com',
    displayName: 'Robert Lee',
    realName: 'Robert Lee',
    profile: {
      title: 'Senior Product Manager',
      department: 'Product',
      interests: ['product strategy', 'user experience', 'data analysis', 'mentoring'],
      status: 'Working from home',
      statusEmoji: ':house:',
      phone: '+1 (555) 123-4577',
      skype: 'robert.lee'
    },
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567901',
    slackTeamId: 'T1234567890',
    email: 'anna.kim@company.com',
    displayName: 'Anna Kim',
    realName: 'Anna Kim',
    profile: {
      title: 'UI Designer',
      department: 'Design',
      interests: ['visual design', 'illustration', 'user interface', 'art'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4578',
      skype: 'anna.kim'
    },
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567902',
    slackTeamId: 'T1234567890',
    email: 'thomas.white@company.com',
    displayName: 'Thomas White',
    realName: 'Thomas White',
    profile: {
      title: 'Data Engineer',
      department: 'Data',
      interests: ['data pipelines', 'etl', 'big data', 'python'],
      status: 'In a meeting',
      statusEmoji: ':meeting:',
      phone: '+1 (555) 123-4579',
      skype: 'thomas.white'
    },
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567903',
    slackTeamId: 'T1234567890',
    email: 'jessica.martinez@company.com',
    displayName: 'Jessica Martinez',
    realName: 'Jessica Martinez',
    profile: {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      interests: ['customer experience', 'relationship building', 'product adoption', 'communication'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4580',
      skype: 'jessica.martinez'
    },
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567904',
    slackTeamId: 'T1234567890',
    email: 'daniel.clark@company.com',
    displayName: 'Daniel Clark',
    realName: 'Daniel Clark',
    profile: {
      title: 'Security Engineer',
      department: 'Engineering',
      interests: ['cybersecurity', 'penetration testing', 'security architecture', 'privacy'],
      status: 'Working from home',
      statusEmoji: ':house:',
      phone: '+1 (555) 123-4581',
      skype: 'daniel.clark'
    },
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567905',
    slackTeamId: 'T1234567890',
    email: 'rachel.green@company.com',
    displayName: 'Rachel Green',
    realName: 'Rachel Green',
    profile: {
      title: 'Business Analyst',
      department: 'Product',
      interests: ['business analysis', 'requirements gathering', 'process improvement', 'data analysis'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4582',
      skype: 'rachel.green'
    },
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567906',
    slackTeamId: 'T1234567890',
    email: 'kevin.rodriguez@company.com',
    displayName: 'Kevin Rodriguez',
    realName: 'Kevin Rodriguez',
    profile: {
      title: 'Mobile Developer',
      department: 'Engineering',
      interests: ['ios development', 'swift', 'mobile apps', 'user experience'],
      status: 'In a meeting',
      statusEmoji: ':meeting:',
      phone: '+1 (555) 123-4583',
      skype: 'kevin.rodriguez'
    },
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567907',
    slackTeamId: 'T1234567890',
    email: 'amanda.foster@company.com',
    displayName: 'Amanda Foster',
    realName: 'Amanda Foster',
    profile: {
      title: 'Content Strategist',
      department: 'Marketing',
      interests: ['content strategy', 'copywriting', 'seo', 'brand voice'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4584',
      skype: 'amanda.foster'
    },
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567908',
    slackTeamId: 'T1234567890',
    email: 'michael.thompson@company.com',
    displayName: 'Michael Thompson',
    realName: 'Michael Thompson',
    profile: {
      title: 'Technical Lead',
      department: 'Engineering',
      interests: ['technical leadership', 'architecture', 'mentoring', 'system design'],
      status: 'Working from home',
      statusEmoji: ':house:',
      phone: '+1 (555) 123-4585',
      skype: 'michael.thompson'
    },
    avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  {
    slackUserId: 'U1234567909',
    slackTeamId: 'T1234567890',
    email: 'laura.davis@company.com',
    displayName: 'Laura Davis',
    realName: 'Laura Davis',
    profile: {
      title: 'Product Designer',
      department: 'Design',
      interests: ['product design', 'user research', 'prototyping', 'design thinking'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4586',
      skype: 'laura.davis'
    },
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false,
    isBot: false,
    timezone: 'America/New_York',
    locale: 'en-US'
  }
];

const demoRelationships = [
  {
    userId: 'U1234567890', // Current user (John Doe)
    teamId: 'T1234567890',
    contactId: 'U1234567891', // Sarah Smith
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567891', channelName: 'product-eng', isPrivate: false }
    ],
    sharedInterests: ['coffee', 'data analysis'],
    notes: 'Great collaborator on product features. We work closely on user-facing functionality.',
    tags: ['product', 'collaboration', 'cross-functional'],
    lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    interactionCount: 15
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567892', // Mike Johnson
    relationshipType: 'team_member',
    addedVia: 'channel_members',
    sourceChannel: 'C1234567892',
    sharedChannels: [
      { channelId: 'C1234567892', channelName: 'design-eng', isPrivate: false }
    ],
    sharedInterests: ['user experience'],
    notes: 'Works on UI/UX for our features. Great design sense and attention to detail.',
    tags: ['design', 'team', 'ui-ux'],
    lastInteraction: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago (medium weight)
    interactionCount: 8
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567893', // Lisa Wang
    relationshipType: 'mentor',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567893', channelName: 'data-science', isPrivate: false }
    ],
    sharedInterests: ['machine learning', 'python'],
    notes: 'Mentors me on data analysis and ML projects. Helped me understand complex algorithms.',
    tags: ['mentor', 'data', 'ml', 'learning'],
    lastInteraction: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago (medium weight)
    interactionCount: 25
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567894', // David Brown
    relationshipType: 'manager',
    addedVia: 'direct_reports',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567894', channelName: 'engineering-leads', isPrivate: true }
    ],
    sharedInterests: ['mentoring'],
    notes: 'My direct manager, great leadership style. Provides excellent career guidance.',
    tags: ['manager', 'leadership', 'career'],
    lastInteraction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    interactionCount: 12
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567895', // Emma Wilson
    relationshipType: 'team_member',
    addedVia: 'channel_members',
    sourceChannel: 'C1234567895',
    sharedChannels: [
      { channelId: 'C1234567895', channelName: 'frontend-team', isPrivate: false }
    ],
    sharedInterests: ['react', 'coffee'],
    notes: 'Frontend developer on our team. We collaborate on React components and user interfaces.',
    tags: ['frontend', 'team', 'react'],
    lastInteraction: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    interactionCount: 18
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567896', // Alex Chen
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567896', channelName: 'backend-team', isPrivate: false }
    ],
    sharedInterests: ['system design'],
    notes: 'Backend developer. We work together on API design and database schemas.',
    tags: ['backend', 'api', 'database'],
    lastInteraction: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago (medium weight)
    interactionCount: 22
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567897', // Maria Garcia
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567897', channelName: 'marketing', isPrivate: false }
    ],
    sharedInterests: ['analytics'],
    notes: 'Marketing manager. We collaborate on tracking user behavior and analytics implementation.',
    tags: ['marketing', 'analytics', 'cross-functional'],
    lastInteraction: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000), // 8 months ago (light weight)
    interactionCount: 9
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567898', // James Taylor
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567898', channelName: 'devops', isPrivate: false }
    ],
    sharedInterests: ['automation'],
    notes: 'DevOps engineer. Helps with deployment automation and infrastructure setup.',
    tags: ['devops', 'infrastructure', 'automation'],
    lastInteraction: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 13 months ago (light weight)
    interactionCount: 14
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567899', // Sophie Anderson
    relationshipType: 'team_member',
    addedVia: 'channel_members',
    sourceChannel: 'C1234567899',
    sharedChannels: [
      { channelId: 'C1234567899', channelName: 'qa-team', isPrivate: false }
    ],
    sharedInterests: ['coffee'],
    notes: 'QA engineer on our team. Ensures our features are thoroughly tested before release.',
    tags: ['qa', 'testing', 'team'],
    lastInteraction: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), // 10 months ago (light weight)
    interactionCount: 11
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567900', // Robert Lee
    relationshipType: 'mentor',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567900', channelName: 'product-leads', isPrivate: true }
    ],
    sharedInterests: ['product strategy', 'data analysis'],
    notes: 'Senior PM who mentors me on product thinking and user-centered design.',
    tags: ['mentor', 'product', 'strategy'],
    lastInteraction: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000), // 20 months ago (light weight)
    interactionCount: 16
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567901', // Anna Kim
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567901', channelName: 'design-team', isPrivate: false }
    ],
    sharedInterests: ['user interface'],
    notes: 'UI designer. We work together on visual design and user interface improvements.',
    tags: ['design', 'ui', 'visual'],
    lastInteraction: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 months ago (medium weight)
    interactionCount: 7
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567902', // Thomas White
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567902', channelName: 'data-team', isPrivate: false }
    ],
    sharedInterests: ['python'],
    notes: 'Data engineer. We collaborate on data pipelines and ETL processes.',
    tags: ['data', 'etl', 'pipelines'],
    lastInteraction: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    interactionCount: 13
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567903', // Jessica Martinez
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567903', channelName: 'customer-success', isPrivate: false }
    ],
    sharedInterests: ['communication'],
    notes: 'Customer Success Manager. We work together on customer feedback and feature requests.',
    tags: ['customer-success', 'feedback', 'communication'],
    lastInteraction: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000), // 15 months ago (light weight)
    interactionCount: 6
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567904', // Daniel Clark
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567904', channelName: 'security', isPrivate: true }
    ],
    sharedInterests: ['privacy'],
    notes: 'Security engineer. We collaborate on security reviews and privacy compliance.',
    tags: ['security', 'privacy', 'compliance'],
    lastInteraction: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    interactionCount: 5
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567905', // Rachel Green
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567905', channelName: 'product-team', isPrivate: false }
    ],
    sharedInterests: ['data analysis'],
    notes: 'Business Analyst. We work together on requirements gathering and data analysis.',
    tags: ['business-analysis', 'requirements', 'data'],
    lastInteraction: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago (medium weight)
    interactionCount: 10
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567906', // Kevin Rodriguez
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567906', channelName: 'mobile-team', isPrivate: false }
    ],
    sharedInterests: ['user experience'],
    notes: 'Mobile developer. We collaborate on mobile app features and user experience.',
    tags: ['mobile', 'ios', 'user-experience'],
    lastInteraction: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
    interactionCount: 8
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567907', // Amanda Foster
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567907', channelName: 'marketing', isPrivate: false }
    ],
    sharedInterests: ['brand voice'],
    notes: 'Content Strategist. We work together on product messaging and brand voice.',
    tags: ['content', 'marketing', 'brand'],
    lastInteraction: new Date(Date.now() - 720 * 24 * 60 * 60 * 1000), // 2 years ago (light weight)
    interactionCount: 4
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567908', // Michael Thompson
    relationshipType: 'mentor',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567908', channelName: 'tech-leads', isPrivate: true }
    ],
    sharedInterests: ['architecture', 'mentoring'],
    notes: 'Technical Lead who mentors me on system architecture and technical decision making.',
    tags: ['mentor', 'architecture', 'technical-leadership'],
    lastInteraction: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    interactionCount: 19
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567909', // Laura Davis
    relationshipType: 'colleague',
    addedVia: 'manual',
    sharedChannels: [
      { channelId: 'C1234567890', channelName: 'general', isPrivate: false },
      { channelId: 'C1234567909', channelName: 'design-team', isPrivate: false }
    ],
    sharedInterests: ['user research'],
    notes: 'Product Designer. We collaborate on user research and design thinking workshops.',
    tags: ['design', 'user-research', 'design-thinking'],
    lastInteraction: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
    interactionCount: 12
  }
];

const demoInteractions = [
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567891',
    channelId: 'D1234567890',
    channelType: 'im',
    messageId: 'msg1',
    messageType: 'sent',
    messageText: 'Hey Sarah, can we discuss the new feature requirements?',
    messageTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    hasReactions: true,
    reactionCount: 1,
    hasThread: false,
    threadCount: 0
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567892',
    channelId: 'C1234567892',
    channelType: 'public_channel',
    messageId: 'msg2',
    messageType: 'sent',
    messageText: 'Mike, the new design looks great!',
    messageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    hasReactions: true,
    reactionCount: 2,
    hasThread: true,
    threadCount: 3
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567893',
    channelId: 'D1234567891',
    channelType: 'im',
    messageId: 'msg3',
    messageType: 'received',
    messageText: 'Great work on the ML model! Here are some suggestions...',
    messageTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    hasReactions: false,
    reactionCount: 0,
    hasThread: false,
    threadCount: 0
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567894',
    channelId: 'D1234567892',
    channelType: 'im',
    messageId: 'msg4',
    messageType: 'sent',
    messageText: 'David, I have some questions about the upcoming sprint planning.',
    messageTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    hasReactions: true,
    reactionCount: 1,
    hasThread: false,
    threadCount: 0
  },
  {
    userId: 'U1234567890',
    teamId: 'T1234567890',
    contactId: 'U1234567895',
    channelId: 'C1234567895',
    channelType: 'public_channel',
    messageId: 'msg5',
    messageType: 'sent',
    messageText: 'Emma, can you review this React component?',
    messageTimestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    hasReactions: true,
    reactionCount: 1,
    hasThread: true,
    threadCount: 2
  }
];

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...');

    // Clear existing data
    await User.deleteMany({});
    await Relationship.deleteMany({});
    await Interaction.deleteMany({});

    // Insert demo users
    const createdUsers = await User.insertMany(demoUsers);
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // Insert demo relationships
    const createdRelationships = await Relationship.insertMany(demoRelationships);
    console.log(`✅ Created ${createdRelationships.length} demo relationships`);

    // Insert demo interactions
    const createdInteractions = await Interaction.insertMany(demoInteractions);
    console.log(`✅ Created ${createdInteractions.length} demo interactions`);

    console.log('🎉 Demo data seeded successfully!');
    return {
      users: createdUsers.length,
      relationships: createdRelationships.length,
      interactions: createdInteractions.length
    };
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

module.exports = { seedDemoData, demoUsers, demoRelationships, demoInteractions }; 