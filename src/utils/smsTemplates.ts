
interface SMSConfig {
  max_length: number;
  required_fields: string[];
}

interface SMSTemplates {
  operational: string;
  delayed: string;
  broken: string;
}

export const smsAlert = {
  config: {
    max_length: 160,
    required_fields: ['location', 'status']
  } as SMSConfig,
  
  templates: {
    operational: 'Ferry {location}: Next at {time}',
    delayed: 'Delay: {reason}. Next in {mins} mins',
    broken: 'Service interrupted. Use {alternative_route}'
  } as SMSTemplates,

  formatMessage: (
    template: keyof SMSTemplates, 
    variables: Record<string, string | number>
  ): string => {
    let message = smsAlert.templates[template];
    
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
    
    if (message.length > smsAlert.config.max_length) {
      return message.substring(0, smsAlert.config.max_length - 3) + '...';
    }
    
    return message;
  },

  validateInput: (input: { location?: string; status?: string }): boolean => {
    return smsAlert.config.required_fields.every(field => 
      input[field as keyof typeof input] !== undefined
    );
  }
};
