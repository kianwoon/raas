'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GlossaryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Terms', count: 85 },
    { id: 'ai-basics', name: 'AI Basics', count: 15 },
    { id: 'fairness', name: 'Fairness', count: 18 },
    { id: 'transparency', name: 'Transparency', count: 16 },
    { id: 'accountability', name: 'Accountability', count: 12 },
    { id: 'ethics', name: 'Ethics', count: 14 },
    { id: 'technical', name: 'Technical', count: 10 },
  ];

  const glossaryTerms = [
    // AI Basics
    {
      id: 1,
      term: 'Artificial Intelligence (AI)',
      definition: 'The simulation of human intelligence in machines that are programmed to think like humans and mimic their actions.',
      category: 'ai-basics',
      related: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
      examples: ['Virtual assistants', 'Self-driving cars', 'Image recognition systems'],
      importance: 'High',
    },
    {
      id: 2,
      term: 'Machine Learning (ML)',
      definition: 'A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.',
      category: 'ai-basics',
      related: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
      examples: ['Spam filters', 'Recommendation systems', 'Predictive maintenance'],
      importance: 'High',
    },
    {
      id: 3,
      term: 'Deep Learning',
      definition: 'A subset of machine learning based on artificial neural networks with multiple layers.',
      category: 'ai-basics',
      related: ['Neural Networks', 'Convolutional Neural Networks', 'Recurrent Neural Networks'],
      examples: ['Image recognition', 'Natural language processing', 'Speech recognition'],
      importance: 'High',
    },
    {
      id: 4,
      term: 'Neural Network',
      definition: 'A series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.',
      category: 'ai-basics',
      related: ['Deep Learning', 'Backpropagation', 'Activation Functions'],
      examples: ['Pattern recognition', 'Classification tasks', 'Regression analysis'],
      importance: 'High',
    },
    {
      id: 5,
      term: 'Supervised Learning',
      definition: 'A type of machine learning where the model is trained on labeled data.',
      category: 'ai-basics',
      related: ['Classification', 'Regression', 'Training Data'],
      examples: ['Email spam detection', 'House price prediction', 'Medical diagnosis'],
      importance: 'High',
    },
    {
      id: 6,
      term: 'Unsupervised Learning',
      definition: 'A type of machine learning where the model learns patterns from unlabeled data.',
      category: 'ai-basics',
      related: ['Clustering', 'Dimensionality Reduction', 'Anomaly Detection'],
      examples: ['Customer segmentation', 'Fraud detection', 'Market basket analysis'],
      importance: 'Medium',
    },
    {
      id: 7,
      term: 'Reinforcement Learning',
      definition: 'A type of machine learning where an agent learns to make decisions by taking actions in an environment to maximize rewards.',
      category: 'ai-basics',
      related: ['Q-Learning', 'Policy Gradient', 'Markov Decision Process'],
      examples: ['Game playing AI', 'Robotics', 'Resource management'],
      importance: 'Medium',
    },
    {
      id: 8,
      term: 'Natural Language Processing (NLP)',
      definition: 'A branch of AI that helps computers understand, interpret and manipulate human language.',
      category: 'ai-basics',
      related: ['Text Analysis', 'Sentiment Analysis', 'Language Models'],
      examples: ['Chatbots', 'Translation services', 'Voice assistants'],
      importance: 'High',
    },
    {
      id: 9,
      term: 'Computer Vision',
      definition: 'A field of AI that trains computers to interpret and understand the visual world.',
      category: 'ai-basics',
      related: ['Image Recognition', 'Object Detection', 'Facial Recognition'],
      examples: ['Self-driving cars', 'Medical imaging', 'Quality control'],
      importance: 'High',
    },
    {
      id: 10,
      term: 'Algorithm',
      definition: 'A set of rules or instructions given to an AI system to help it learn from data.',
      category: 'ai-basics',
      related: ['Machine Learning', 'Model Training', 'Optimization'],
      examples: ['Search algorithms', 'Sorting algorithms', 'Recommendation algorithms'],
      importance: 'High',
    },
    {
      id: 11,
      term: 'Model',
      definition: 'A mathematical representation of a real-world process created by training an algorithm on data.',
      category: 'ai-basics',
      related: ['Algorithm', 'Training', 'Prediction'],
      examples: ['Linear regression model', 'Neural network model', 'Decision tree model'],
      importance: 'High',
    },
    {
      id: 12,
      term: 'Training Data',
      definition: 'The dataset used to train an AI model to recognize patterns and make predictions.',
      category: 'ai-basics',
      related: ['Test Data', 'Validation Data', 'Dataset'],
      examples: ['Labeled images for classification', 'Text data for NLP', 'Financial data for prediction'],
      importance: 'High',
    },
    {
      id: 13,
      term: 'Overfitting',
      definition: 'When a model learns the training data too well, including noise and outliers, resulting in poor performance on new data.',
      category: 'ai-basics',
      related: ['Underfitting', 'Regularization', 'Generalization'],
      examples: ['Model memorizing training examples', 'Complex models on small datasets'],
      importance: 'High',
    },
    {
      id: 14,
      term: 'Underfitting',
      definition: 'When a model is too simple to capture the underlying patterns in the data.',
      category: 'ai-basics',
      related: ['Overfitting', 'Model Complexity', 'Bias'],
      examples: ['Linear model for nonlinear data', 'Insufficient model capacity'],
      importance: 'High',
    },
    {
      id: 15,
      term: 'Generalization',
      definition: 'The ability of an AI model to perform well on new, unseen data.',
      category: 'ai-basics',
      related: ['Overfitting', 'Underfitting', 'Test Performance'],
      examples: ['Model performing well on validation data', 'Robust predictions in production'],
      importance: 'High',
    },
    // Fairness Terms
    {
      id: 16,
      term: 'AI Fairness',
      definition: 'The principle that AI systems should treat all individuals and groups equitably, without discrimination or bias.',
      category: 'fairness',
      related: ['Bias', 'Discrimination', 'Equity'],
      examples: ['Fair loan approval systems', 'Unbiased hiring algorithms', 'Equitable healthcare AI'],
      importance: 'High',
    },
    {
      id: 17,
      term: 'Algorithmic Bias',
      definition: 'Systematic and repeatable errors in a computer system that create unfair outcomes.',
      category: 'fairness',
      related: ['AI Fairness', 'Discrimination', 'Prejudice'],
      examples: ['Gender bias in hiring algorithms', 'Racial bias in facial recognition', 'Age bias in credit scoring'],
      importance: 'High',
    },
    {
      id: 18,
      term: 'Disparate Impact',
      definition: 'When a seemingly neutral policy or practice has a disproportionate adverse effect on a protected group.',
      category: 'fairness',
      related: ['Discrimination', 'Protected Attributes', 'Fairness Metrics'],
      examples: ['AI systems favoring certain demographics', 'Loan approval disparities', 'Hiring algorithm discrimination'],
      importance: 'High',
    },
    {
      id: 19,
      term: 'Protected Attributes',
      definition: 'Characteristics that are legally protected from discrimination, such as race, gender, age, religion, etc.',
      category: 'fairness',
      related: ['Discrimination', 'Fairness', 'Legal Compliance'],
      examples: ['Race, ethnicity, gender', 'Age, disability, religion', 'Marital status, pregnancy'],
      importance: 'High',
    },
    {
      id: 20,
      term: 'Fairness Metrics',
      definition: 'Mathematical measures used to quantify and evaluate the fairness of AI systems.',
      category: 'fairness',
      related: ['Statistical Parity', 'Equal Opportunity', 'Predictive Parity'],
      examples: ['Demographic parity', 'Equalized odds', 'Calibration'],
      importance: 'High',
    },
    {
      id: 21,
      term: 'Statistical Parity',
      definition: 'A fairness metric requiring that predictions be independent of protected attributes.',
      category: 'fairness',
      related: ['Fairness Metrics', 'Demographic Parity', 'Group Fairness'],
      examples: ['Equal acceptance rates across groups', 'Balanced representation in outcomes'],
      importance: 'High',
    },
    {
      id: 22,
      term: 'Equal Opportunity',
      definition: 'A fairness metric requiring that true positive rates be equal across different groups.',
      category: 'fairness',
      related: ['Fairness Metrics', 'True Positive Rate', 'Group Fairness'],
      examples: ['Equal hiring rates for qualified candidates', 'Balanced medical diagnosis accuracy'],
      importance: 'High',
    },
    {
      id: 23,
      term: 'Predictive Parity',
      definition: 'A fairness metric requiring that precision be equal across different groups.',
      category: 'fairness',
      related: ['Fairness Metrics', 'Precision', 'Group Fairness'],
      examples: ['Equal accuracy in positive predictions', 'Consistent prediction quality'],
      importance: 'High',
    },
    {
      id: 24,
      term: 'Individual Fairness',
      definition: 'The principle that similar individuals should receive similar treatment from AI systems.',
      category: 'fairness',
      related: ['Group Fairness', 'Fairness Metrics', 'Similarity'],
      examples: ['Similar customers getting similar offers', 'Consistent treatment for similar cases'],
      importance: 'Medium',
    },
    {
      id: 25,
      term: 'Group Fairness',
      definition: 'The principle that different demographic groups should receive equitable treatment from AI systems.',
      category: 'fairness',
      related: ['Individual Fairness', 'Fairness Metrics', 'Demographic Groups'],
      examples: ['Equal outcomes across demographic groups', 'Balanced representation'],
      importance: 'High',
    },
    {
      id: 26,
      term: 'Bias Mitigation',
      definition: 'Techniques and strategies used to reduce or eliminate bias in AI systems.',
      category: 'fairness',
      related: ['Algorithmic Bias', 'Fairness', 'Preprocessing'],
      examples: ['Data preprocessing techniques', 'Algorithm adjustments', 'Post-processing corrections'],
      importance: 'High',
    },
    {
      id: 27,
      term: 'Adversarial Debiasing',
      definition: 'A technique that uses adversarial training to remove bias from AI models.',
      category: 'fairness',
      related: ['Bias Mitigation', 'Adversarial Training', 'Fairness'],
      examples: ['Removing gender bias from text', 'Reducing racial bias in predictions'],
      importance: 'Medium',
    },
    {
      id: 28,
      term: 'Fairness Constraints',
      definition: 'Mathematical constraints added to optimization problems to ensure fairness in AI systems.',
      category: 'fairness',
      related: ['Fairness Metrics', 'Optimization', 'Constraints'],
      examples: ['Enforcing demographic parity', 'Balancing error rates across groups'],
      importance: 'Medium',
    },
    {
      id: 29,
      term: 'Intersectionality',
      definition: 'The study of overlapping or intersecting social identities and related systems of discrimination.',
      category: 'fairness',
      related: ['Protected Attributes', 'Discrimination', 'Social Identity'],
      examples: ['Gender + race discrimination', 'Age + disability bias', 'Multiple protected attributes'],
      importance: 'High',
    },
    {
      id: 30,
      term: 'Fairness-Aware Machine Learning',
      definition: 'Machine learning approaches that explicitly consider and optimize for fairness criteria.',
      category: 'fairness',
      related: ['Fairness', 'Machine Learning', 'Bias Mitigation'],
      examples: ['Fair classification algorithms', 'Bias-aware data preprocessing', 'Fair optimization techniques'],
      importance: 'High',
    },
    {
      id: 31,
      term: 'Equity',
      definition: 'The principle of treating people fairly based on their individual needs and circumstances.',
      category: 'fairness',
      related: ['Equality', 'Fairness', 'Justice'],
      examples: ['Tailored support for disadvantaged groups', 'Needs-based resource allocation'],
      importance: 'High',
    },
    {
      id: 32,
      term: 'Equality',
      definition: 'The principle of treating everyone the same, regardless of their individual circumstances.',
      category: 'fairness',
      related: ['Equity', 'Fairness', 'Uniform Treatment'],
      examples: ['Same rules for everyone', 'Uniform application of policies'],
      importance: 'Medium',
    },
    {
      id: 33,
      term: 'Inclusive AI',
      definition: 'AI systems designed to serve and represent diverse populations equitably.',
      category: 'fairness',
      related: ['Diversity', 'Fairness', 'Representation'],
      examples: ['AI trained on diverse datasets', 'Multilingual AI systems', 'Culturally sensitive AI'],
      importance: 'High',
    },
    // Transparency Terms
    {
      id: 34,
      term: 'AI Transparency',
      definition: 'The principle that AI systems should be open, understandable, and explainable to stakeholders.',
      category: 'transparency',
      related: ['Explainability', 'Interpretability', 'Accountability'],
      examples: ['Open source AI models', 'Documented decision processes', 'Transparent algorithms'],
      importance: 'High',
    },
    {
      id: 35,
      term: 'Explainable AI (XAI)',
      definition: 'AI systems designed to provide human-understandable explanations for their decisions and actions.',
      category: 'transparency',
      related: ['Interpretability', 'Transparency', 'Black Box'],
      examples: ['SHAP values', 'LIME explanations', 'Decision trees'],
      importance: 'High',
    },
    {
      id: 36,
      term: 'Interpretability',
      definition: 'The degree to which a human can understand and explain an AI model\'s decisions.',
      category: 'transparency',
      related: ['Explainable AI', 'Transparency', 'Model Complexity'],
      examples: ['Linear models', 'Decision trees', 'Rule-based systems'],
      importance: 'High',
    },
    {
      id: 37,
      term: 'Black Box',
      definition: 'AI systems whose internal workings are not visible or understandable to humans.',
      category: 'transparency',
      related: ['Explainable AI', 'Transparency', 'Opacity'],
      examples: ['Deep neural networks', 'Complex ensemble models', 'Opaque decision systems'],
      importance: 'High',
    },
    {
      id: 38,
      term: 'Model Card',
      definition: 'A structured document that provides essential facts about an AI model to enable transparency.',
      category: 'transparency',
      related: ['Transparency', 'Documentation', 'Model Reporting'],
      examples: ['Model performance metrics', 'Training data details', 'Intended use cases'],
      importance: 'High',
    },
    {
      id: 39,
      term: 'Data Sheet',
      definition: 'A document that provides transparency about datasets used to train AI models.',
      category: 'transparency',
      related: ['Transparency', 'Dataset', 'Documentation'],
      examples: ['Data collection methods', 'Dataset composition', 'Known limitations'],
      importance: 'Medium',
    },
    {
      id: 40,
      term: 'SHAP Values',
      definition: 'A unified approach to explain the output of any machine learning model.',
      category: 'transparency',
      related: ['Explainable AI', 'Feature Importance', 'Model Interpretation'],
      examples: ['Feature attribution in predictions', 'Model explanation visualization', 'Understanding feature impact'],
      importance: 'High',
    },
    {
      id: 41,
      term: 'LIME',
      definition: 'Local Interpretable Model-agnostic Explanations - a technique to explain individual predictions.',
      category: 'transparency',
      related: ['Explainable AI', 'Local Explanations', 'Model Interpretation'],
      examples: ['Explaining single predictions', 'Local model approximation', 'Instance-based explanations'],
      importance: 'High',
    },
    {
      id: 42,
      term: 'Feature Importance',
      definition: 'A measure of how much each input feature contributes to a model\'s predictions.',
      category: 'transparency',
      related: ['Explainable AI', 'Model Interpretation', 'Feature Analysis'],
      examples: ['Coefficient magnitudes', 'Permutation importance', 'Decision tree splits'],
      importance: 'High',
    },
    {
      id: 43,
      term: 'Decision Boundary',
      definition: 'The surface that separates different classes in the feature space of a classification model.',
      category: 'transparency',
      related: ['Classification', 'Model Visualization', 'Feature Space'],
      examples: ['Linear classifiers', 'Non-linear boundaries', 'Multi-class separation'],
      importance: 'Medium',
    },
    {
      id: 44,
      term: 'Attention Mechanisms',
      definition: 'Neural network components that help models focus on relevant parts of input data.',
      category: 'transparency',
      related: ['Deep Learning', 'Neural Networks', 'Model Interpretation'],
      examples: ['Transformer models', 'Image captioning', 'Machine translation'],
      importance: 'High',
    },
    {
      id: 45,
      term: 'Saliency Maps',
      definition: 'Visual representations that highlight important regions in input data for model decisions.',
      category: 'transparency',
      related: ['Computer Vision', 'Model Interpretation', 'Visualization'],
      examples: ['Image classification explanations', 'Object detection focus areas', 'Medical imaging interpretation'],
      importance: 'Medium',
    },
    {
      id: 46,
      term: 'Counterfactual Explanations',
      definition: 'Explanations that show how changing input features would change the model\'s prediction.',
      category: 'transparency',
      related: ['Explainable AI', 'Causal Reasoning', 'Model Interpretation'],
      examples: ['What-if scenarios', 'Minimal change explanations', 'Actionable insights'],
      importance: 'Medium',
    },
    {
      id: 47,
      term: 'Model Documentation',
      definition: 'Comprehensive documentation about AI models, their development, and their intended use.',
      category: 'transparency',
      related: ['Model Cards', 'Transparency', 'Documentation'],
      examples: ['Technical specifications', 'Performance characteristics', 'Usage guidelines'],
      importance: 'High',
    },
    {
      id: 48,
      term: 'Algorithmic Transparency',
      definition: 'The practice of making AI algorithms and their decision processes open and understandable.',
      category: 'transparency',
      related: ['Transparency', 'Open Source', 'Algorithm Disclosure'],
      examples: ['Published algorithms', 'Open source implementations', 'Technical white papers'],
      importance: 'High',
    },
    {
      id: 49,
      term: 'Transparency Reports',
      definition: 'Regular reports about AI system performance, impacts, and decisions.',
      category: 'transparency',
      related: ['Transparency', 'Reporting', 'Accountability'],
      examples: ['Quarterly performance reports', 'Bias assessment reports', 'Impact assessments'],
      importance: 'Medium',
    },
    // Accountability Terms
    {
      id: 50,
      term: 'AI Accountability',
      definition: 'The principle that individuals and organizations should be responsible for the impacts of AI systems.',
      category: 'accountability',
      related: ['Responsibility', 'Governance', 'Oversight'],
      examples: ['Clear assignment of responsibility', 'Audit trails for AI decisions', 'Liability frameworks'],
      importance: 'High',
    },
    {
      id: 51,
      term: 'AI Governance',
      definition: 'The framework of rules, practices, and processes for directing and managing AI systems.',
      category: 'accountability',
      related: ['Accountability', 'Oversight', 'Compliance'],
      examples: ['AI ethics committees', 'Review boards', 'Governance frameworks'],
      importance: 'High',
    },
    {
      id: 52,
      term: 'Audit Trail',
      definition: 'A record that shows the sequence of activities or changes made in an AI system.',
      category: 'accountability',
      related: ['Accountability', 'Transparency', 'Logging'],
      examples: ['Model training logs', 'Decision records', 'Version history'],
      importance: 'High',
    },
    {
      id: 53,
      term: 'AI Ethics Committee',
      definition: 'A group responsible for reviewing and overseeing AI systems for ethical compliance.',
      category: 'accountability',
      related: ['Governance', 'Oversight', 'Ethics'],
      examples: ['Internal review boards', 'External advisory panels', 'Multi-stakeholder committees'],
      importance: 'Medium',
    },
    {
      id: 54,
      term: 'Compliance',
      definition: 'The act of adhering to laws, regulations, and standards related to AI systems.',
      category: 'accountability',
      related: ['Governance', 'Regulation', 'Legal Requirements'],
      examples: ['GDPR compliance', 'Industry standards', 'Regulatory requirements'],
      importance: 'High',
    },
    {
      id: 55,
      term: 'Risk Assessment',
      definition: 'The process of identifying and evaluating potential risks associated with AI systems.',
      category: 'accountability',
      related: ['Risk Management', 'Impact Assessment', 'Safety'],
      examples: ['Bias risk analysis', 'Privacy impact assessment', 'Security risk evaluation'],
      importance: 'High',
    },
    {
      id: 56,
      term: 'Impact Assessment',
      definition: 'A systematic evaluation of the potential impacts of AI systems on individuals and society.',
      category: 'accountability',
      related: ['Risk Assessment', 'Impact Evaluation', 'Social Impact'],
      examples: ['Algorithmic impact assessment', 'Social impact analysis', 'Environmental impact assessment'],
      importance: 'High',
    },
    {
      id: 57,
      term: 'Liability',
      definition: 'Legal responsibility for damages or harms caused by AI systems.',
      category: 'accountability',
      related: ['Accountability', 'Legal Responsibility', 'Harm'],
      examples: ['Product liability for AI', 'Negligence in AI deployment', 'Vicarious liability'],
      importance: 'High',
    },
    {
      id: 58,
      term: 'Oversight',
      definition: 'The process of monitoring and supervising AI systems to ensure proper functioning.',
      category: 'accountability',
      related: ['Governance', 'Monitoring', 'Supervision'],
      examples: ['Continuous monitoring', 'Regular audits', 'Performance reviews'],
      importance: 'High',
    },
    {
      id: 59,
      term: 'Redress Mechanisms',
      definition: 'Processes for addressing and remedying harms caused by AI systems.',
      category: 'accountability',
      related: ['Accountability', 'Appeals', 'Remediation'],
      examples: ['Appeals processes', 'Compensation mechanisms', 'Correction procedures'],
      importance: 'Medium',
    },
    {
      id: 60,
      term: 'Stakeholder Engagement',
      definition: 'The process of involving all relevant parties in AI development and deployment.',
      category: 'accountability',
      related: ['Governance', 'Participation', 'Inclusive Design'],
      examples: ['Public consultations', 'User feedback mechanisms', 'Multi-stakeholder workshops'],
      importance: 'Medium',
    },
    {
      id: 61,
      term: 'AI Risk Management',
      definition: 'The systematic process of identifying, assessing, and mitigating risks in AI systems.',
      category: 'accountability',
      related: ['Risk Assessment', 'Risk Mitigation', 'Safety'],
      examples: ['Risk mitigation strategies', 'Contingency planning', 'Risk monitoring'],
      importance: 'High',
    },
    // Ethics Terms
    {
      id: 62,
      term: 'AI Ethics',
      definition: 'The moral principles and values that guide the development and use of AI systems.',
      category: 'ethics',
      related: ['Ethical Principles', 'Moral Values', 'Responsible AI'],
      examples: ['Beneficence', 'Non-maleficence', 'Autonomy', 'Justice'],
      importance: 'High',
    },
    {
      id: 63,
      term: 'Beneficence',
      definition: 'The ethical principle of doing good and promoting well-being through AI systems.',
      category: 'ethics',
      related: ['AI Ethics', 'Non-maleficence', 'Well-being'],
      examples: ['Healthcare AI improving patient outcomes', 'Educational AI enhancing learning', 'Environmental AI for sustainability'],
      importance: 'High',
    },
    {
      id: 64,
      term: 'Non-maleficence',
      definition: 'The ethical principle of avoiding harm through AI systems.',
      category: 'ethics',
      related: ['AI Ethics', 'Beneficence', 'Harm Prevention'],
      examples: ['Safety features in autonomous vehicles', 'Bias mitigation in hiring AI', 'Privacy protection in data processing'],
      importance: 'High',
    },
    {
      id: 65,
      term: 'Autonomy',
      definition: 'The ethical principle of respecting human decision-making and control.',
      category: 'ethics',
      related: ['AI Ethics', 'Human Control', 'Agency'],
      examples: ['Human-in-the-loop systems', 'Meaningful human control', 'User consent'],
      importance: 'High',
    },
    {
      id: 66,
      term: 'Justice',
      definition: 'The ethical principle of fairness and equity in AI systems.',
      category: 'ethics',
      related: ['AI Ethics', 'Fairness', 'Equity'],
      examples: ['Fair resource allocation', 'Equitable access to AI benefits', 'Distributive justice'],
      importance: 'High',
    },
    {
      id: 67,
      term: 'Privacy',
      definition: 'The right of individuals to control their personal information and how it\'s used by AI systems.',
      category: 'ethics',
      related: ['Data Protection', 'Confidentiality', 'Personal Information'],
      examples: ['Data anonymization', 'Consent mechanisms', 'Privacy-preserving AI'],
      importance: 'High',
    },
    {
      id: 68,
      term: 'Informed Consent',
      definition: 'The process of obtaining voluntary agreement from individuals for AI system interactions.',
      category: 'ethics',
      related: ['Autonomy', 'Privacy', 'User Rights'],
      examples: ['Clear privacy policies', 'Opt-in mechanisms', 'User agreements'],
      importance: 'High',
    },
    {
      id: 69,
      term: 'Human Dignity',
      definition: 'The principle of respecting the inherent worth of all individuals in AI systems.',
      category: 'ethics',
      related: ['AI Ethics', 'Human Rights', 'Respect'],
      examples: ['Dignity-preserving AI design', 'Respectful user interfaces', 'Avoiding dehumanization'],
      importance: 'High',
    },
    {
      id: 70,
      term: 'Social Good',
      definition: 'The positive impact of AI systems on society and the common good.',
      category: 'ethics',
      related: ['AI Ethics', 'Beneficence', 'Societal Impact'],
      examples: ['AI for social services', 'Environmental monitoring AI', 'Educational accessibility AI'],
      importance: 'Medium',
    },
    {
      id: 71,
      term: 'Digital Divide',
      definition: 'The gap between those who have access to AI technology and those who don\'t.',
      category: 'ethics',
      related: ['Equity', 'Access', 'Inclusion'],
      examples: ['Technology access disparities', 'Digital literacy gaps', 'Infrastructure inequalities'],
      importance: 'High',
    },
    {
      id: 72,
      term: 'Sustainable AI',
      definition: 'AI systems designed and operated with environmental sustainability in mind.',
      category: 'ethics',
      related: ['Environmental Impact', 'Green AI', 'Sustainability'],
      examples: ['Energy-efficient algorithms', 'Carbon footprint reduction', 'Sustainable data centers'],
      importance: 'Medium',
    },
    {
      id: 73,
      term: 'Cultural Sensitivity',
      definition: 'The awareness and respect for cultural differences in AI system design and deployment.',
      category: 'ethics',
      related: ['Inclusive AI', 'Diversity', 'Cultural Awareness'],
      examples: ['Culturally appropriate interfaces', 'Localized AI systems', 'Cultural bias mitigation'],
      importance: 'Medium',
    },
    {
      id: 74,
      term: 'AI for Social Good',
      definition: 'AI applications designed to address social and humanitarian challenges.',
      category: 'ethics',
      related: ['Social Good', 'Beneficence', 'Humanitarian AI'],
      examples: ['Disaster response AI', 'Poverty alleviation AI', 'Healthcare access AI'],
      importance: 'Medium',
    },
    {
      id: 75,
      term: 'Responsible AI',
      definition: 'The development and deployment of AI systems that are ethical, fair, transparent, and accountable.',
      category: 'ethics',
      related: ['AI Ethics', 'Trustworthy AI', 'Reliable AI'],
      examples: ['Ethical AI development practices', 'Responsible deployment strategies', 'Continuous monitoring'],
      importance: 'High',
    },
    // Technical Terms
    {
      id: 76,
      term: 'Feature Engineering',
      definition: 'The process of selecting and transforming variables for use in machine learning models.',
      category: 'technical',
      related: ['Data Preprocessing', 'Feature Selection', 'Model Training'],
      examples: ['Creating new features from existing data', 'Normalizing features', 'Handling missing values'],
      importance: 'High',
    },
    {
      id: 77,
      term: 'Hyperparameter Tuning',
      definition: 'The process of optimizing the parameters that control the learning process of a model.',
      category: 'technical',
      related: ['Model Optimization', 'Parameter Tuning', 'Model Performance'],
      examples: ['Learning rate optimization', 'Regularization parameter tuning', 'Neural network architecture search'],
      importance: 'High',
    },
    {
      id: 78,
      term: 'Cross-Validation',
      definition: 'A technique for evaluating model performance by splitting data into multiple subsets.',
      category: 'technical',
      related: ['Model Evaluation', 'Validation', 'Performance Metrics'],
      examples: ['K-fold cross-validation', 'Stratified cross-validation', 'Time series cross-validation'],
      importance: 'High',
    },
    {
      id: 79,
      term: 'Ensemble Learning',
      definition: 'The technique of combining multiple machine learning models to improve performance.',
      category: 'technical',
      related: ['Model Combination', 'Voting Classifiers', 'Bagging'],
      examples: ['Random forests', 'Gradient boosting', 'Stacking'],
      importance: 'High',
    },
    {
      id: 80,
      term: 'Transfer Learning',
      definition: 'The technique of applying knowledge from one domain to another related domain.',
      category: 'technical',
      related: ['Domain Adaptation', 'Pre-trained Models', 'Knowledge Transfer'],
      examples: ['Using pre-trained language models', 'Fine-tuning image classifiers', 'Domain-specific adaptation'],
      importance: 'High',
    },
    {
      id: 81,
      term: 'Data Augmentation',
      definition: 'The process of creating additional training data by modifying existing data.',
      category: 'technical',
      related: ['Training Data', 'Data Generation', 'Model Robustness'],
      examples: ['Image rotation and flipping', 'Text paraphrasing', 'Audio signal modification'],
      importance: 'High',
    },
    {
      id: 82,
      term: 'Model Deployment',
      definition: 'The process of making a trained AI model available for use in a production environment.',
      category: 'technical',
      related: ['Production Environment', 'Model Serving', 'Inference'],
      examples: ['API deployment', 'Edge deployment', 'Cloud deployment'],
      importance: 'High',
    },
    {
      id: 83,
      term: 'Model Monitoring',
      definition: 'The ongoing process of tracking AI model performance and behavior in production.',
      category: 'technical',
      related: ['Model Maintenance', 'Performance Tracking', 'Alerting'],
      examples: ['Performance metric monitoring', 'Data drift detection', 'Model decay detection'],
      importance: 'High',
    },
    {
      id: 84,
      term: 'Model Versioning',
      definition: 'The practice of tracking different versions of AI models throughout their lifecycle.',
      category: 'technical',
      related: ['Model Management', 'Version Control', 'Lifecycle Management'],
      examples: ['Model registry', 'Version tracking', 'Rollback capabilities'],
      importance: 'Medium',
    },
    {
      id: 85,
      term: 'MLOps',
      definition: 'Machine Learning Operations - the practice of deploying and maintaining machine learning models in production.',
      category: 'technical',
      related: ['Model Deployment', 'Model Monitoring', 'DevOps'],
      examples: ['CI/CD for ML', 'Model pipelines', 'Automated retraining'],
      importance: 'High',
    },
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.related.some(rel => rel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Group terms alphabetically
  const groupedTerms = filteredTerms.reduce((groups, term) => {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(term);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Glossary</h1>
            <p className="text-xl text-emerald-100 mb-8">
              Comprehensive definitions of key terms in AI fairness, transparency, accountability, and ethics
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 px-3 py-1 rounded-full">85 Terms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 px-3 py-1 rounded-full">6 Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 px-3 py-1 rounded-full">A-Z Index</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search terms, definitions, or related concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {searchQuery === '' && selectedCategory === 'all' && (
        <section className="py-8 bg-emerald-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">85</div>
                  <div className="text-sm text-gray-600">Total Terms</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">6</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">15+</div>
                  <div className="text-sm text-gray-600">AI Basics</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">18</div>
                  <div className="text-sm text-gray-600">Fairness Terms</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Alphabet Navigation */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(groupedTerms).sort().map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Glossary Terms */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Terms' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-gray-600">
                {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No terms found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedTerms).sort().map(([letter, terms]) => (
                  <div key={letter} id={letter}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 sticky top-4 bg-white py-2 border-b">
                      {letter}
                    </h3>
                    <div className="space-y-6">
                      {terms.map((term) => (
                        <div key={term.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                  {term.category}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                  term.importance === 'High' ? 'bg-red-100 text-red-800' :
                                  term.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {term.importance} Importance
                                </span>
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 mb-3">{term.term}</h4>
                              <p className="text-gray-600 mb-4">{term.definition}</p>
                              
                              {term.related && term.related.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">Related Terms</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {term.related.map((relatedTerm) => (
                                      <span key={relatedTerm} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                                        {relatedTerm}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {term.examples && term.examples.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">Examples</h5>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    {term.examples.map((example, index) => (
                                      <li key={index}>{example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(c => c.id !== 'all').map((category) => (
                <div key={category.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-emerald-600 font-bold text-xl">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.count} terms</p>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Browse Terms →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Help Us Improve</h2>
            <p className="text-xl text-emerald-100 mb-8">
              Missing a term? Suggest additions to our glossary to help build a more comprehensive resource
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3 px-8 rounded-lg transition duration-300">
                Suggest a Term
              </button>
              <Link
                href="/resources"
                className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Browse All Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}