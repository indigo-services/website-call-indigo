import React from 'react';
import { Box, Typography, Flex, LinkButton } from '@strapi/design-system';
import { 
  Database, 
  Image as ImageIcon, 
  Globe, 
  Rocket, 
  ManyWays, 
  Shield, 
  Lock, 
  Sparkle, 
  ExternalLink 
} from '@strapi/icons';

const DemoWidget = () => {
  return (
    <Box
      padding={4}
      background="neutral0"
      borderColor="neutral150"
      hasRadius
    >
      <Flex alignItems="flex-start" gap={6} direction="row" style={{ flexWrap: 'nowrap' }}>
        {/* Left Section */}
        <Box style={{ flex: '1 1 45%' }}>
          <Flex direction="column" alignItems="flex-start" gap={2}>
            <Box marginBottom={2}>
              <Typography variant="alpha" textColor="neutral800" as="h2">
                Indigo Studio Admin
              </Typography>
            </Box>

            <Typography variant="omega" textColor="neutral600">
              This local CMS workspace is tuned for Indigo-branded content operations across marketing pages, launches, and reusable content blocks.
            </Typography>
            <Typography variant="omega" textColor="neutral600">
              Use this admin as the brand-safe control plane while the public Next experience gets re-skinned around Indigo identity.
            </Typography>
          </Flex>
        </Box>

        {/* Right Section */}
        <Box style={{ flex: '1 1 55%' }}>
          <Flex direction="column" alignItems="flex-start" gap={5}>
            <Flex direction="column" alignItems="flex-start" gap={3}>
              <Typography variant="sigma" textColor="neutral600" textTransform="uppercase">
                Daily Operations
              </Typography>
              <Flex gap={2} wrap="wrap">
                <LinkButton href="/admin/content-manager/" variant="secondary" startIcon={<Database fill="primary600" />}>
                  Content Manager
                </LinkButton>
                <LinkButton href="/admin/plugins/upload" variant="secondary" startIcon={<ImageIcon fill="primary600" />}>
                  Media Library
                </LinkButton>
                <LinkButton href="/admin/settings/internationalization" variant="secondary" startIcon={<Globe fill="primary600" />}>
                  Internationalization
                </LinkButton>
              </Flex>
            </Flex>

            <Flex direction="column" alignItems="flex-start" gap={3}>
              <Flex gap={2}>
                <Typography variant="sigma" textColor="neutral600" textTransform="uppercase">
                  Publishing Controls
                </Typography>
                <Sparkle fill="primary600" width="12px" height="12px" />
              </Flex>
              <Flex gap={2} wrap="wrap">
                <LinkButton href="/admin/plugins/content-releases" variant="secondary" startIcon={<Rocket fill="primary600" />}>
                  Releases
                </LinkButton>
                <LinkButton href="/admin/settings/review-workflows" variant="secondary" startIcon={<ManyWays fill="primary600" />}>
                  Review Workflows
                </LinkButton>
                <LinkButton href="/admin/settings/audit-logs" variant="secondary" startIcon={<Shield fill="primary600" />}>
                  Audit Logs
                </LinkButton>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>

      {/* Bottom Footer Section */}
      <Box 
        marginTop={6} 
        padding={4} 
        borderColor="neutral150"
      >
        <Flex gap={3}>
          <Lock fill="neutral500" width="16px" height="16px" />
          <Typography variant="omega" textColor="neutral600">
            Treat this workspace as the Indigo CMS shell. Keep content models stable on shared environments and do schema changes locally first.{' '}
            <a 
              href="https://github.com/strapi/strapi" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#4945ff', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Review Strapi docs <ExternalLink width="12px" height="12px" />
            </a>{' '}before promoting CMS changes.
          </Typography>
        </Flex>
      </Box>
    </Box>
  );
};

export default DemoWidget;
